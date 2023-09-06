import React, { useCallback } from "react";
import { BackButton } from "../../common/back-button";
import { Plant } from "../../types";
import { PlantSearchInput, PlantingNameAndPlant } from "../../common/plant-search-input";
import { Layout } from "../../common/layout";
import { H1 } from "../../common/h1";
import { Button } from "../../common/button";
import { newPlantPage } from "../../plant/new/page";

export interface NewPlantingPageOneOutput {
  plant: Plant,
  name: string,
}

interface NewPlantingPageOneProps {
  initialSearchText: string,
  onSubmit: (output: NewPlantingPageOneOutput) => void,
}

export function NewPlantingPageOne({
  initialSearchText,
  onSubmit,
}: NewPlantingPageOneProps) {
  const submit = useCallback((plantAndName: PlantingNameAndPlant) => { 
    onSubmit(plantAndName) 
  }, [onSubmit]);

  return (
    <Layout button={<BackButton />} header={<H1>New Planting</H1>}>
      <section className="p-4 flex flex-col h-full">
        <div className="text-2xl mb-2">
          What are you planting?
        </div>
        
        <Button className="text-xl mb-2" linkTo={newPlantPage()}>
          New Plant
        </Button>
        Existing Plant
        <PlantSearchInput initialSearchText={initialSearchText} onSelect={submit} />
      </section>
    </Layout>
  );
}
