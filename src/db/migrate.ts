
export async function migrate(oldVersion: number, newVersion: number, transaction: IDBTransaction) {
    console.log(`Updating from ${oldVersion}`);

    switch (oldVersion + 1) { // Specifically not newVersion as we want all migrations between oldVersion and newVersion
    case 15:
        
    }
}
