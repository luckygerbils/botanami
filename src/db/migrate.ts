
export async function migrate(oldVersion: number, newVersion: number, transaction: IDBTransaction) {
    console.log(`Updating from ${oldVersion}`);

    // switch (oldVersion + 1) {
    // }

    const photoStore = transaction.objectStore("photos");
    if (photoStore.indexNames.contains("byPlantFactId")) {
        photoStore.deleteIndex("byPlantFactId");
        photoStore.createIndex("byPlantFactId", "plantFactId", { unique: false });
    }
}
