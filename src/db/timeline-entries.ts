import { PlantingId, TimelineEntryRecord, TimelineEntryId, TimelineEntry } from "../types";
import { deletePhotosForTimelineEntry } from "./photos";
import { toPromise } from "./util";

export async function getTimelineEntryRecords(plantingId: PlantingId, transaction: IDBTransaction): Promise<TimelineEntryRecord[]> {
    return toPromise(transaction.objectStore("timelineEntries").index("byPlantingId").getAll(plantingId) as IDBRequest<TimelineEntryRecord[]>);
}

export async function getTimelineEntryRecord(entryId: TimelineEntryId, transaction: IDBTransaction): Promise<TimelineEntryRecord> {
    return await toPromise(transaction.objectStore("timelineEntries").get(entryId) as IDBRequest<TimelineEntryRecord>);
}

export async function putTimelineEntryRecord(record: TimelineEntryRecord, transaction: IDBTransaction) {
    await toPromise(transaction.objectStore("timelineEntries").put(record));
}

export async function deleteTimelineEntryRecord(entryId: TimelineEntryId, transaction: IDBTransaction) {
    await toPromise(transaction.objectStore("timelineEntries").delete(entryId));
}

export async function deleteTimelineEntriesByPlantingId(plantingId: PlantingId, transaction: IDBTransaction) {
    const entryIds = await toPromise(transaction.objectStore("timelineEntries").index("byPlantingId").getAllKeys(plantingId) as IDBRequest<TimelineEntryId[]>)
    await Promise.all(entryIds.flatMap(entryId => [
        deleteTimelineEntryRecord(entryId, transaction),
        deletePhotosForTimelineEntry(entryId, transaction)
    ]));
}
