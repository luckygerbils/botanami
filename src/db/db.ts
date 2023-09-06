import { migrate } from "./migrate";

export const DB_VERSION = 14;

let db: Promise<IDBDatabase>;
export function getDb() {
    db ??= new Promise((resolve, reject) => {
        const request = indexedDB.open("botanami", DB_VERSION);
        request.onsuccess = () => {
            resolve(request.result)
        };
        request.onerror = e => reject(e);
        request.onupgradeneeded = async (e: IDBVersionChangeEvent) => {
            if (e.newVersion == null) {
                return;
            }

            const db = request.result;

            let plantingsStore: IDBObjectStore;
            if (!db.objectStoreNames.contains("plantings")) {
                console.log("created plantings store");
                plantingsStore = db.createObjectStore("plantings", { keyPath: "id" });
            } else {
                plantingsStore = request.transaction!.objectStore("plantings");
            }


            let timelineEntryStore: IDBObjectStore;
            if (!db.objectStoreNames.contains("timelineEntries")) {
                console.log("created timelineEntries store");
                timelineEntryStore = db.createObjectStore("timelineEntries", { keyPath: "id" });
            } else {
                timelineEntryStore = request.transaction!.objectStore("timelineEntries");
            }

            if (!timelineEntryStore.indexNames.contains("byPlantingId")) {
                timelineEntryStore.createIndex("byPlantingId", "plantingId", { unique: false });
            }


            let plantStore: IDBObjectStore;
            if (!db.objectStoreNames.contains("plants")) {
                console.log("created plants store");
                plantStore = db.createObjectStore("plants", { keyPath: "id" });
            } else {
                plantStore = request.transaction!.objectStore("plants");
            }

            let plantFactsStore: IDBObjectStore;
            if (!db.objectStoreNames.contains("plantFacts")) {
                console.log("created plantFacts store");
                plantFactsStore = db.createObjectStore("plantFacts", { keyPath: "id" });
            } else {
                plantFactsStore = request.transaction!.objectStore("plantFacts");
            }

            if (!plantFactsStore.indexNames.contains("byPlantId")) {
                plantFactsStore.createIndex("byPlantId", "plantId", { unique: false });
            }


            let photoStore: IDBObjectStore;
            if (!db.objectStoreNames.contains("photos")) {
                console.log("created photos store");
                photoStore = db.createObjectStore("photos", { keyPath: "id" });
            } else {
                photoStore = request.transaction!.objectStore("photos");
            }

            if (!photoStore.indexNames.contains("byTimelineEntryId")) {
                photoStore.createIndex("byTimelineEntryId", "timelineEntryId", { unique: false });
            }

            if (!photoStore.indexNames.contains("byPlantFactId")) {
                photoStore.createIndex("byPlantFactId", "plantFactId", { unique: false });
            }

            if (db.objectStoreNames.contains("facts")) {
                db.deleteObjectStore("facts");
            }

            await migrate(e.oldVersion, e.newVersion, request.transaction!);
        };
    });
    return db;
}