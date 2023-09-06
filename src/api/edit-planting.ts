import { deletePlantingRecord, getDb, getPlantingRecord, getPlantRecord } from "../db";
import { PlantingId } from "../types";
import { PlantingIdNotFoundError } from "./planting";

export interface EditPlantingPageProps {
    plantingDetails: {
        id: PlantingId,
        name: string,
    },
    plantDetails: {
        scientificName: string,
        commonNames: string[],
    },
}

export async function getEditPlantingPageInitialProps(plantingId: PlantingId): Promise<EditPlantingPageProps> {
    const transaction = (await getDb()).transaction(["plantings", "plants"], "readonly");
    const [ 
        plantingRecord, 
    ] = await Promise.all([
        getPlantingRecord(plantingId, transaction),
    ]);

    if (plantingRecord == null) {
        throw new PlantingIdNotFoundError(plantingId);
    }

    const plantRecord = await getPlantRecord(plantingRecord.plant, transaction);

    return {
        plantingDetails: {
            id: plantingRecord.id,
            name: plantingRecord.name
        },
        plantDetails: {
            scientificName: plantRecord.scientificName,
            commonNames: plantRecord.commonNames,
        },
    };
}

export async function deletePlanting(plantingId: PlantingId): Promise<void> {
    const transaction = (await getDb()).transaction(["plantings", "timelineEntries", "photos"], "readwrite");
    await deletePlantingRecord(plantingId, transaction);
}