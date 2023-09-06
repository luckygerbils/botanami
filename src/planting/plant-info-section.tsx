import React, {  } from "react";
import { Planting } from "../types";
import { Button } from "../common/button";
import { CommonNameList } from "../common/common-name-list";
import { ScientificName } from "../common/scientific-name";
import { plantPage as plantPage } from "../plant/page";

interface PlantInfoSectionProps {
  plant: {
    id: string,
    scientificName: string,
    commonNames: string[],
  },
}

export function PlantInfoSection({
  plant,
}: PlantInfoSectionProps) {
  
  return (
    <section className="mt-2">
      <div className="text-xl px-4 mb-2 flex">
        <div>
          {plant.scientificName && 
            <ScientificName name={plant.scientificName} />}
          <div className="text-xl italic">
            <CommonNameList list={plant.commonNames} />
          </div>
        </div>
        <div className="grow flex items-center justify-center px-3">
          <Button variant="secondary" linkTo={plantPage({ plantId: plant.id })}>
            Plant&nbsp;Info
          </Button>
        </div>
      </div>
    </section>
  );
}