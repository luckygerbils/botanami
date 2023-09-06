import { getDb, putPlantingRecord, putTimelineEntryRecord, putPhotos } from "../db";
import { PlantId, PlantingId, Tag } from "../types";
import { NewTimelineEntry } from "./timeline-entry";

export interface NewPlanting {
    id: PlantingId,
    name: string,
    tags: Tag[],
    plantId: PlantId,
}
export async function createPlanting(
    {
        id,
        name,
        tags,
        plantId,
    }: NewPlanting, 
    initialTimelineEntry?: NewTimelineEntry
): Promise<void> {
    const stores = initialTimelineEntry != null ? ["plantings", "timelineEntries", "photos"] : ["plantings"];
    const transaction = (await getDb()).transaction(stores, "readwrite");
    await Promise.all([
        putPlantingRecord({ id, name, tags, plant: plantId }, transaction),
        initialTimelineEntry && putTimelineEntryRecord({
            id: initialTimelineEntry.id,
            plantingId: id,
            date: initialTimelineEntry.date.toISOString(),
            summary: initialTimelineEntry.summary,
            description: initialTimelineEntry.description,
        }, transaction),
        initialTimelineEntry?.photos && putPhotos(initialTimelineEntry.photos, transaction),
    ]);
}