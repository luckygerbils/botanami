import { PlantId, PlantFactRecord, PlantFactId } from "../types";
import { toPromise } from "./util";

export async function getPlantFactRecord(plantFactId: PlantFactId, transaction: IDBTransaction): Promise<PlantFactRecord> {
    return toPromise(transaction.objectStore("plantFacts").get(plantFactId) as IDBRequest<PlantFactRecord>)
}

export async function getPlantFactRecords(plantId: PlantId, transaction: IDBTransaction): Promise<PlantFactRecord[]> {
    return toPromise(transaction.objectStore("plantFacts").index("byPlantId").getAll(plantId) as IDBRequest<PlantFactRecord[]>)
}

export async function putPlantFactRecord(record: PlantFactRecord, transaction: IDBTransaction): Promise<void> {
    await toPromise(transaction.objectStore("plantFacts").put(record));
}

export async function deletePlantFactRecord(factId: PlantFactId, transaction: IDBTransaction) {
    await toPromise(transaction.objectStore("plantFacts").delete(factId));
}