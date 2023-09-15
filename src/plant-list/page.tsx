import React from "react";
import { Layout } from "../common/layout";
import { FlowerIcon, PlusIcon } from "../common/icons";
import { Button } from "../common/button";
import { H1 } from "../common/h1";
import { MenuButton } from "../common/menu-button";
import { getAllPlantRecords, getDb } from "../db";
import { PlantRecord } from "../types";
import { newPlantPage } from "../plant/new/page";
import { PlantList } from "./list";

export function plantListPage() {
  return "/plant-list";
}
export const regexp = /^\/plant-list|\/$/;
export async function getInitialProps(): Promise<PlantListPageInitialProps> {
    const transaction = (await getDb()).transaction(["plants"], "readonly");
    const plantRecords: PlantRecord[]  = await getAllPlantRecords(transaction);
    return {
        plants: plantRecords.map(({ id, scientificName, commonNames }) => ({ id, scientificName, commonNames }))
    };
}

interface PlantListPageInitialProps {
    plants: {
        id: string,
        scientificName: string,
        commonNames: string[],
    }[],
} 

const PlantListPage: React.FunctionComponent<PlantListPageInitialProps> = ({ 
  plants, 
}) => {
  return (
    <Layout
      button={<MenuButton />} 
      header={<H1>All Plants</H1>}
    >
      {plants.length > 0 && 
        <Button linkTo={newPlantPage()} variant="save" floating>
          <PlusIcon size="lg" />
        </Button>}
      {plants.length > 0 && 
        <PlantList plants={plants} />}
      {plants.length === 0 && (
        <div className="flex flex-col grow justify-center p-4">
          <div className="text-2xl bg-blue-200 p-16 mb-3 rounded text-center">
            <FlowerIcon /><br />
            No plants in the database yet.
          </div>
          <Button className="text-2xl" linkTo={newPlantPage()}>
            <PlusIcon size="lg" /> Add a plant
          </Button>
        </div>
      )}
    </Layout>
  )
}
export default PlantListPage;