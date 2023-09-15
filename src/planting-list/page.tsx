import React from "react";
import { Layout } from "../common/layout";
import { PlantingList } from "./list";
import { FlowerIcon, PlusIcon } from "../common/icons";
import { Button } from "../common/button";
import { MenuButton } from "../common/menu-button";
import { H1 } from "../common/h1";
import { PlantingsListPageInitialProps, getPlantingsListPageInitialProps } from "../api/plantings-list";
import { newPlantingPage } from "../planting/new/page";

export function plantingListPage() {
  return "/list";
}
export const regexp = /^\/list|\/$/;
export async function getInitialProps(): Promise<PlantingsListPageInitialProps> {
  return await getPlantingsListPageInitialProps();
}
const PlantingListPage: React.FunctionComponent<PlantingsListPageInitialProps> = ({ 
  plantings, 
}) => {
  return (
    <Layout
      button={<MenuButton />} 
      header={<H1>Botanami</H1>}
    >
      {plantings.length > 0 && 
        <Button linkTo={newPlantingPage()} variant="save" floating>
          <PlusIcon size="lg" />
        </Button>}
      {plantings.length > 0 && 
        <PlantingList plantings={plantings} />}
      {plantings.length === 0 && (
        <div className="flex flex-col grow justify-center p-4">
          <div className="text-2xl bg-blue-200 p-16 mb-3 rounded text-center">
            <FlowerIcon /><br />
            No plants in this garden yet.
          </div>
          <Button className="text-2xl" linkTo={newPlantingPage()}>
            <PlusIcon size="lg" /> Add a plant
          </Button>
        </div>
      )}
    </Layout>
  )
}
export default PlantingListPage;