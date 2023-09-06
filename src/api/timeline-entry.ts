import { deletePhotosForTimelineEntry, deleteTimelineEntryRecord, getDb, getPhoto, getPhotosForTimelineEntry, getPlantingRecord, getTimelineEntryRecord, getTimelineEntryRecords, putPhoto, putPhotos, putTimelineEntryRecord } from "../db";
import { Photo, PlantingId, TimelineEntry, TimelineEntryId, TimelineEntryRecord } from "../types";
import { PlantingIdNotFoundError } from "./planting";

export interface TimelineEntryPageProps {
    plantingId: PlantingId,
    plantingName: string,
    timelineEntry?: NewTimelineEntry,
}
export interface NewTimelineEntry {
    id: TimelineEntryId,
    date: Date,
    summary?: string,
    description?: string,
    photos?: Photo[],
}

export async function getTimelineEntryPageInitialProps(plantingId: PlantingId, entryId?: TimelineEntryId): Promise<TimelineEntryPageProps> {
    if (entryId == null) {
        const transaction = (await getDb()).transaction(["plantings"], "readonly");
        const plantingRecord = await getPlantingRecord(plantingId, transaction);
        if (plantingRecord == null) {
            throw new PlantingIdNotFoundError(plantingId);
        }
        return { plantingId, plantingName: plantingRecord.name };
    }

    const transaction = (await getDb()).transaction(["plantings", "timelineEntries", "photos"], "readonly");
    const [
        plantingRecord,
        timelineEntryRecord,
        photos
    ] = await Promise.all([
        getPlantingRecord(plantingId, transaction),
        getTimelineEntryRecord(entryId, transaction),
        getPhotosForTimelineEntry(entryId, transaction),
    ]);

    if (plantingRecord == null) {
        throw new PlantingIdNotFoundError(plantingId);
    }

    return {
        plantingId,
        plantingName: plantingRecord.name,
        timelineEntry: {
            id: timelineEntryRecord.id,
            date: new Date(timelineEntryRecord.date),
            summary: timelineEntryRecord.summary,
            description: timelineEntryRecord.description,
            photos,
        }
    };
}

export async function putTimelineEntry(plantingId: PlantingId, entry: NewTimelineEntry) {
    const stores = entry.photos != null ? ["timelineEntries", "photos"] : ["timelineEntries"]
    const transaction = (await getDb()).transaction(stores, "readwrite");
    await Promise.all([
        putTimelineEntryRecord({
            id: entry.id,
            plantingId,
            date: entry.date.toISOString(),
            summary: entry.summary,
            description: entry.description,
        }, transaction),
        putPhotos(entry.photos ?? [], transaction),
    ])
}

export async function deleteTimelineEntry(entryId: TimelineEntryId) {
    const transaction = (await getDb()).transaction(["timelineEntries", "photos"], "readwrite");
    await Promise.all([
        deleteTimelineEntryRecord(entryId, transaction),
        deletePhotosForTimelineEntry(entryId, transaction),
    ]);
}
