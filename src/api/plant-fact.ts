import { deletePhotosForPlantFact, deletePlantFactRecord, getDb, getPhotosForPlantFact, getPlantFactRecord, putPhotos, putPlantFactRecord } from "../db";
import { Photo, PlantFactId, PlantId } from "../types";

export interface PlantFactPageProps {
    plantId: PlantId,
    fact?: {
        id: PlantFactId,
        summary?: string,
        description?: string,
        photos?: Photo[],
        source?: {
            url: string,
            website: string,
        }
    }
}

export async function getPlantFactPageInitialProps(plantId: PlantId, factId?: PlantFactId): Promise<PlantFactPageProps> {
    if (factId == null) {
        return {
            plantId
        };
    }

    const transaction = (await getDb()).transaction(["plants", "plantFacts", "photos"], "readonly");
    const [
        factRecord,
        photos,
    ] = await Promise.all([
        getPlantFactRecord(factId, transaction),
        getPhotosForPlantFact(factId, transaction),
    ]);

    return {
        plantId,
        fact: {
            ...factRecord,
            photos
        }
    };
}

export interface PutPlantFactInput {
    id: PlantFactId,
    summary?: string,
    description?: string,
    photos?: Photo[],
    source?: {
        website: string,
        url: string,
    }
}

export async function putPlantFact(
    plantId: PlantId, 
    {
        id,
        summary,
        description,
        source,
        photos
    }: PutPlantFactInput) {
    const stores = photos != null ? ["plantFacts", "photos"] : ["plantFacts"];
    const transaction = (await getDb()).transaction(stores, "readwrite");

    await Promise.all([
        putPlantFactRecord({
            id,
            plantId,
            summary,
            description,
            source,
        }, transaction),
        putPhotos(photos ?? [], transaction),
    ]);
}

export async function deletePlantFact(factId: PlantFactId) {
    const transaction = (await getDb()).transaction(["plantFacts", "photos"], "readwrite");
    await Promise.all([
        deletePlantFactRecord(factId, transaction),
        deletePhotosForPlantFact(factId, transaction)
    ]);
}