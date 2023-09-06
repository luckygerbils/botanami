import React, { useCallback } from "react";
import { BackButton } from "../../../common/back-button";
import { Plant, PlantingId, RequestProps } from "../../../types";
import { PlantSearchInput, PlantingNameAndPlant } from "../../../common/plant-search-input";
import { CommonNameList } from "../../../common/common-name-list";
import { ScientificName } from "../../../common/scientific-name";
import { Layout } from "../../../common/layout";
import { H1 } from "../../../common/h1";
import { back } from "../../../common/link";
import { EditPlantingChangePlantPageProps, changePlantAndName, getEditPlantingChangePlantPageInitialProps } from "../../../api/change-plant";

export function changePlantPage({ plantingId }: { plantingId: string }): string {
  return `/planting/${plantingId}/edit/plant`;
}
export const regexp = /^\/planting\/(?<plantingId>[^/]*)\/edit\/plant$/;
export async function getInitialProps(requestProps: RequestProps<{ plantingId: PlantingId }>): Promise<EditPlantingChangePlantPageProps> {
  const { groups: { plantingId } } = requestProps;
  return await getEditPlantingChangePlantPageInitialProps(plantingId);
}

export interface ChangePlantPageOutput {
  plant: Plant,
  name: string,
}

export default function EditPlantingChangePlantPage({
  plantingDetails: {
    id: plantingId
  },
  plantDetails: {
    scientificName,
    commonNames,
  }
}: EditPlantingChangePlantPageProps) {
  const updatePlantAndRedirectBack = useCallback(async ({ name, plant }: PlantingNameAndPlant) => {
    await changePlantAndName(plantingId, plant.id, name);
    back();
  }, [plantingId]);

  return (
    <Layout 
      title="Change Plant"
      button={<BackButton />}
      header={<H1>Change Plant</H1>}
    >
      <div className="flex flex-col h-full">
        <section>
          <header className="text-2xl px-3 my-2">
            Current Plant
          </header>
          <div className="px-4">
            {scientificName && 
              <ScientificName name={scientificName} />}
            <div className="text-xl italic">
              <CommonNameList list={commonNames} />
            </div>
          </div>
        </section>
        <section>
          <header className="text-2xl px-3 my-2">
            Select a different plant:
          </header>
          <div className="px-4">
            <PlantSearchInput onSelect={updatePlantAndRedirectBack} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
