import { getDb, getPhotosForTimelineEntry, getPlantRecord, getPlantingRecord, getTimelineEntryRecords } from "../db";
import { PhotoId, PlantId, PlantingId, TimelineEntryId } from "../types";

export interface PlantingPageProps {
    plantingDetails: {
        id: PlantingId,
        name: string,
    },
    plantDetails: {
        id: PlantId,
        scientificName: string,
        commonNames: string[],
    }
    timelineEntries: {
        id: TimelineEntryId,
        date: string,
        summary?: string,
        description?: string,
        photos?: {
            id: PhotoId,
            blob: Blob,
        }[],
    }[]
}

export async function getPlantingPageInitialProps(plantingId: PlantingId): Promise<PlantingPageProps> {
    const transaction = (await getDb()).transaction(["plantings", "timelineEntries", "plants", "photos"], "readonly");
    const [ 
        plantingRecord, 
        timelineEntryRecords 
    ] = await Promise.all([
        getPlantingRecord(plantingId, transaction),
        getTimelineEntryRecords(plantingId, transaction),
    ]);

    if (plantingRecord == null) {
        throw new PlantingIdNotFoundError(plantingId);
    }

    const plantRecord = await getPlantRecord(plantingRecord.plant, transaction);
    const photosByTimelineEntryId = Object.fromEntries(
        await Promise.all(timelineEntryRecords.map(async ({id}) => [id, await getPhotosForTimelineEntry(id, transaction)] as const)));

    return {
        plantingDetails: {
            id: plantingRecord.id,
            name: plantingRecord.name
        },
        plantDetails: {
            id: plantRecord.id,
            scientificName: plantRecord.scientificName,
            commonNames: plantRecord.commonNames,
        },
        timelineEntries: timelineEntryRecords.map(({
            id,
            date,
            description,
            summary,
            photos,
        }) => ({
            id,
            date,
            description,
            summary,
            photos: photosByTimelineEntryId[id],
        }))
    };
}

export class PlantingIdNotFoundError extends Error {
    readonly plantingId: PlantingId;
    constructor(plantingId: PlantingId) {
        super(`No planting record found with id ${plantingId}`);
        this.name = PlantingIdNotFoundError.name;
        this.plantingId = plantingId;
    }
}