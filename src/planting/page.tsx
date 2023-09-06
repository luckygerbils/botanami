import React, {  } from "react";
import { BackButton } from "../common/back-button";
import { Layout } from "../common/layout";
import { PlantingId, RequestProps } from "../types";
import { TimelineSection } from "./timeline-section";
import { PlantInfoSection } from "./plant-info-section";
import { Button } from "../common/button";
import { PencilSquareIcon } from "../common/icons";
import { editPlantingPage } from "./edit/page";
import { PlantingPageProps, getPlantingPageInitialProps } from "../api/planting";

export const regexp = /^\/planting\/(?<plantingId>[^/]*)$/;
export async function getInitialProps(requestProps: RequestProps<{ plantingId: string }>): Promise<PlantingPageProps> {
  const { groups: { plantingId } } = requestProps;
  return await getPlantingPageInitialProps(plantingId);
}
export function plantingPage({ plantingId }: { plantingId: PlantingId }): string {
  return `/planting/${plantingId}`;
}

export default function PlantingPage({
  plantingDetails: planting,
  plantDetails,
  timelineEntries,
}: PlantingPageProps) {
  return (
    <Layout 
      title={planting.name}
      button={<BackButton href="/list" />} 
      header={
        <div className="grow flex items-center my-1">
          <h1 className="text-2xl">{planting.name}</h1>
          <div className="grow flex justify-end items-center">
            <Button className="text-xl mr-4" variant="link" linkTo={editPlantingPage({ plantingId: planting.id })}>
                <PencilSquareIcon />&nbsp;Edit
            </Button>
          </div>
        </div>
      }>
      <PlantInfoSection plant={plantDetails} />
      <TimelineSection plantingId={planting.id} timeline={timelineEntries} />
    </Layout>
  )
}