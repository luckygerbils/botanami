import { PlantingRecord, PlantId, PlantingId } from "../types";
import { deleteTimelineEntriesByPlantingId } from "./timeline-entries";
import { toPromise } from "./util";

export async function getAllPlantingRecords(transaction: IDBTransaction): Promise<PlantingRecord[]> {
    return toPromise(transaction.objectStore("plantings").getAll() as IDBRequest<PlantingRecord[]>);
}

export async function getPlantingRecord(id: PlantingId, transaction: IDBTransaction): Promise<PlantingRecord|null> {
    return toPromise(transaction.objectStore("plantings").get(id) as IDBRequest<PlantingRecord|null>);
}

export async function putPlantingRecord(record: PlantingRecord, transaction: IDBTransaction): Promise<void> {
    await toPromise(transaction.objectStore("plantings").put(record));
}

export async function deletePlantingRecord(plantingId: PlantId, transaction: IDBTransaction): Promise<void> {
    await Promise.all([
        toPromise(transaction.objectStore("plantings").delete(plantingId)),
        deleteTimelineEntriesByPlantingId(plantingId, transaction),
    ]);
}