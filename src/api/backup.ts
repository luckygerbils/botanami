import { tar, untar } from "../util/tar";
import { DB_VERSION, getDb } from "../db/db";

export async function createBackupFile(backupName: string): Promise<Blob> {
    const db = await getDb();
    const transaction = db.transaction(Array.from(db.objectStoreNames), "readonly");
    
    const files = (await Promise.all(Array.from(transaction.objectStoreNames)
        .map(async objectStoreName => {
            const objectStore = transaction.objectStore(objectStoreName);
            const records: unknown[] = await new Promise((resolve, reject) => {
                const request = objectStore.getAll();
                request.onsuccess = () => resolve(request.result as unknown[]);
                request.onerror = () => reject(request.error);
            });
            return records.flatMap(record => {
                const keyPath = typeof objectStore.keyPath === "string" ? [objectStore.keyPath] : objectStore.keyPath;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                const recordKey = String(keyPath.reduce((obj, key) => (obj as any)[key], record));
                const blobs: {name: string, content: Blob}[] = [];
                const recordJson = JSON.stringify(
                    record, 
                    (key: string, value) => {
                        if (key === "blob") {
                            if (!(value instanceof Blob)) {
                                // eslint-disable-next-line
                                throw new Error(`marker 'blob' used for a non-blob value. Was: ${value}`);
                            }
                            const blobId = blobs.length;
                            // Assume JPEG for now
                            const blobName = `${blobId}.jpg`;
                            blobs.push({
                                name: `${objectStoreName}/${recordKey}/blobs/${blobName}`,
                                content: value,
                            });
                            return blobName;
                        } else if (value instanceof Date) {
                            throw new Error("date");
                            // return `Date:${value.toISOString()}`;
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return value;
                    }, 
                    " " /* indent */);

                return [
                    {
                        name: blobs.length > 0 ? `${objectStoreName}/${recordKey}/record.json` : `${objectStoreName}/${recordKey}.json`,
                        content: recordJson,
                    },
                    ...blobs,
                ];
            })
        }))).flat(1);

    return tar([
      {
        name: "metadata.json",
        content: JSON.stringify({ 
          dbVersion: DB_VERSION,
          date: new Date().toISOString(),
        }, null, " "),
      },
      ...files
    ]);
}

export async function restoreBackupFile(backupFile: Blob): Promise<Record<string, number>> {
    const entries = await untar(backupFile);
    const entriesByName = Object.fromEntries(entries.map(({ name, content }) => [name, content as Uint8Array]));

    const metadataEntry = entriesByName["metadata.json"];
    if (metadataEntry == null) {
        throw new Error("Backup is missing metadata.json");
    }

    const { dbVersion: backupDbVersion } = JSON.parse(String.fromCharCode(...metadataEntry)) as { dbVersion: number };

    const db = await getDb();
    if (backupDbVersion > db.version) {
        throw new Error(`Backup is from newer version, unable to restore. This version: ${db.version}, Backup: ${backupDbVersion}`);
    }

    const transaction = db.transaction(Array.from(db.objectStoreNames), "readwrite");

    console.log("Clearing stores");

    // Clear all stores
    await Promise.all(Array.from(db.objectStoreNames).map(objectStoreName => {
        return new Promise((resolve, reject) => {
            const request = transaction.objectStore(objectStoreName).clear();
            request.onsuccess = () => resolve(request.result as void);
            request.onerror = () => reject(request.error);
        });
    }));

    const recordEntryNames = Object.keys(entriesByName)
        .map(entryName => {
            return [
                entryName, 
                entryName.match(/(?<objectStoreName>[^/]*)\/(?<recordKey>[^/]*)\/record.json/)
                ?? entryName.match(/(?<objectStoreName>[^/]*)\/(?<recordKey>[^/]*).json/)
            ] as const;
        })
        .filter(([,match]) => match != null);

    const countsByStore: Record<string, number> = {};
    for (const [recordEntryName, match] of recordEntryNames) {
        const { objectStoreName, recordKey } = match!.groups!;

        const record = JSON.parse(
            String.fromCharCode(...entriesByName[recordEntryName]), 
            (key, value) => {
                if (key === "blob") {
                    return new Blob([
                        entriesByName[`${objectStoreName}/${recordKey}/blobs/${value}`],
                    ], {
                        type: "image/jpeg",
                    });
                } else if (typeof value === "string" && value.startsWith("Date:")) {
                    return new Date(value.slice("Date:".length));
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return value;
            }) as unknown;

        transaction.objectStore(objectStoreName).put(record);
        countsByStore[objectStoreName] = (countsByStore[objectStoreName] ?? 0) + 1;
    }
    return countsByStore;
}