import { PlantId, PlantRecord } from "../types";
import { toPromise } from "./util";

export async function getAllPlantRecords(transaction: IDBTransaction): Promise<PlantRecord[]> {
    return toPromise(transaction.objectStore("plants").getAll() as IDBRequest<PlantRecord[]>);
}

export async function getPlantRecord(id: PlantId, transaction: IDBTransaction): Promise<PlantRecord> {
    return toPromise(transaction.objectStore("plants").get(id) as IDBRequest<PlantRecord>);
}

export async function putPlantRecord(plant: PlantRecord, transaction: IDBTransaction): Promise<void> {
    await toPromise(transaction.objectStore("plants").put(plant));
}