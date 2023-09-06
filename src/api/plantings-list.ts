import { getAllPlantingRecords, getDb, getPlantRecord } from "../db";
import { PlantingRecord, Tag } from "../types";

export interface PlantingsListPageInitialProps {
    plantings: PlantingListEntry[],
}

export interface PlantingListEntry {
    id: string,
    name: string,
    plant: {
      scientificName: string,
    },
    tags: Tag[]
}

export async function getPlantingsListPageInitialProps(): Promise<PlantingsListPageInitialProps> {
    const transaction = (await getDb()).transaction(["plantings", "plants"], "readonly");
    const plantingRecords: PlantingRecord[]  = await getAllPlantingRecords(transaction);
    return {
        plantings: await Promise.all(
            plantingRecords.map(
                async record => ({
                    ...record,
                    plant: {
                        scientificName: (await getPlantRecord(record.plant, transaction)).scientificName,
                    }
                })
            )
        ),
    };
}