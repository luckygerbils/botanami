import { getDb, getAllPlantRecords } from "../db";
import { PlantId } from "../types";
import { compareChain, booleanCompare } from "../util/sorting";

export interface PlantSearchMatch {
    match: string,
    matchType: "scientificName"|"commonName",
    matchIndexes: (readonly [number, number])[],
    plant: {
        id: PlantId,
        scientificName: string,
        commonNames: string[],
     },
}

export async function searchPlants(str: string): Promise<PlantSearchMatch[]> {
    const transaction = (await getDb()).transaction("plants", "readonly");

    const normalizedStr = str.toLowerCase();

    function allMatches(str: string, haystackStr: string): (readonly [number, number])[] {
        const indexes: (readonly [number, number])[] = [];
        let i = -1;
        while ((i = haystackStr.indexOf(str, i+1)) !== -1) {
            indexes.push([i, i+str.length] as const);
        }
        return indexes;
    }

    return (await getAllPlantRecords(transaction))
        .flatMap(plant => {
            const result: PlantSearchMatch[] = [];
            const scientificNameMatches = allMatches(normalizedStr, plant.scientificName.toLowerCase());
            if (scientificNameMatches.length > 0) {
                result.push({ matchType: "scientificName", plant, match: plant.scientificName, matchIndexes: scientificNameMatches });
            }
            for (const commonName of plant.commonNames) {
                const commonNameMatches = allMatches(normalizedStr, commonName.toLowerCase());
                if (commonNameMatches.length > 0) {
                    result.push({ matchType: "commonName", plant, match: commonName, matchIndexes: commonNameMatches });
                }
            }
            return result;
        })
        // Sort order:
        // 1. Matches where the match starts with the search string
        // 2. Matches where a word (that isn't the first word) in the match starts with the search string
        // 3. The rest of the matches
        // Subsort all alphabetically
        .sort(compareChain([
            (a, b) => booleanCompare(
                a.match.toLowerCase().startsWith(normalizedStr), 
                b.match.toLowerCase().startsWith(normalizedStr)),
            (a, b) => booleanCompare(
                a.match.toLowerCase().split(" ").some(word => word.startsWith(normalizedStr)), 
                b.match.toLowerCase().split(" ").some(word => word.startsWith(normalizedStr))), 
            (a, b) => a.match.localeCompare(b.match),
        ]));
}