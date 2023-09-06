import { getDb, getPlantingRecord, getPlantRecord, putPlantingRecord } from "../db";
import { PlantId, PlantingId } from "../types";
import { PlantingIdNotFoundError } from "./planting";

export interface EditPlantingChangePlantPageProps {
    plantingDetails: {
        id: PlantingId,
        name: string,
    },
    plantDetails: {
        scientificName: string,
        commonNames: string[],
    },
}

export async function getEditPlantingChangePlantPageInitialProps(plantingId: PlantingId): Promise<EditPlantingChangePlantPageProps> {
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

export async function changePlantAndName(plantingId: PlantingId, newPlantId: PlantId, newName: string): Promise<void> {
    const transaction = (await getDb()).transaction(["plantings"], "readwrite");
    const plantingRecord = await getPlantingRecord(plantingId, transaction);
    if (plantingRecord == null) {
        throw new PlantingIdNotFoundError(plantingId);
    }
    await putPlantingRecord({
        ...plantingRecord,
        plant: newPlantId,
        name: newName,
    }, transaction)
}