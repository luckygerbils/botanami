import { getDb, getPhotosForPlantFact, getPlantFactRecords, getPlantRecord, putPhotos, putPlantFactRecord, putPlantRecord } from "../db";
import { Photo, PlantFactId, PlantId } from "../types";
import { PutPlantFactInput } from "./plant-fact";

export interface PlantPageProps {
    id: PlantId,
    scientificName: string,
    commonNames: string[],
    facts: {
        id: PlantFactId,
        summary?: string,
        description?: string,
        photos?: Photo[],
        source?: {
            website: string,
            url: string,
        }
    }[]
}

export async function getPlantPageInitialProps(id: PlantId): Promise<PlantPageProps> {
    const transaction = (await getDb()).transaction(["plants", "plantFacts", "photos"], "readonly");
    const [
        plantRecord,
        factRecords,
    ] = await Promise.all([
        getPlantRecord(id, transaction),
        getPlantFactRecords(id, transaction),
    ]);
    if (plantRecord == null) {
        throw new PlantIdNotFoundError(id);
    }

    const photosByPlantFactId = Object.fromEntries(
        await Promise.all(factRecords.map(async ({id}) => [id, await getPhotosForPlantFact(id, transaction)] as const)));
    return {
        id: plantRecord.id,
        scientificName: plantRecord.scientificName,
        commonNames: plantRecord.commonNames,
        facts: factRecords.map(({id, ...record}) => ({ ...record, id, photos: photosByPlantFactId[id] }))
    };
}

// export async function getPlant(id: PlantId): Promise<Plant> {
//     const transaction = (await getDb()).transaction(["plants", "plantFacts", "photos"], "readonly");
//     const plantRecord = await getPlantRecord(id, transaction);
//     if (plantRecord == null) {
//         throw new PlantIdNotFoundError(id);
//     } else {
//         return recordToPlant(plantRecord, transaction);
//     }
// }

class PlantIdNotFoundError extends Error {
    readonly plantId: PlantId;
    constructor(plantId: PlantId) {
        super(`No plant found with id ${plantId}`);
        this.name = PlantIdNotFoundError.name;
        this.plantId = plantId;
    }
}

export interface NewPlantInput {
    id: PlantId,
    scientificName: string,
    commonNames: string[],
}

export async function createPlant(
    {
        id,
        scientificName,
        commonNames
    }: NewPlantInput,
    initialFact?: PutPlantFactInput,
): Promise<void> {
    const stores = initialFact != null ? ["plants", "plantFacts", "photos"] : ["plants"];
    const transaction = (await getDb()).transaction(stores, "readwrite");
    await Promise.all([
        putPlantRecord({ id, scientificName, commonNames }, transaction),
        initialFact && putPlantFactRecord({
            id: initialFact.id,
            summary: initialFact.summary,
            description: initialFact.description,
            source: initialFact.source,
            plantId: id,
        }, transaction),
        initialFact?.photos && putPhotos(initialFact.photos, transaction),
    ]);
}