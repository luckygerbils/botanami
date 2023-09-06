import React, { useCallback, useState } from "react";
import { NewPlantingPageOne, NewPlantingPageOneOutput } from "./page-1";
import { NewPlantingPageTwo, NewPlantingPageTwoOutput } from "./page-2";
import { NewPlantingPageThree, NewPlantingPageThreeOutput } from "./page-3";
import { createPlanting } from "../../api/new-planting";
import { goTo } from "../../common/link";
import FailurePage from "../../failure/page";
import { Plant } from "../../types";
import { plantingPage } from "../page";


export function newPlantingPage(): string {
  return `/new-planting`;
}
export const regexp = /^\/new-planting$/;
export async function getInitialProps(): Promise<NewPlantingPageProps> {
  return {};
}

interface NewPlantingPageProps {
}

export default function NewPlantingPage() {
  const [ plant, setPlant ] = useState<Plant|null>(null);
  const [ name, setName ] = useState<string|null>(null);
  const [ location, setLocation ] = useState("");

  const [ pageNum, setPageNum ] = useState(0);
  const nextPage = useCallback(() => setPageNum(current => current + 1), []);
  const prevPage = useCallback(() => setPageNum(current => current - 1), []);

  const submitPageOne = useCallback(({ plant, name }: NewPlantingPageOneOutput) => {
    setPlant(plant);
    setName(name);
    nextPage();
  }, [nextPage]);

  const submitPageTwo = useCallback(({ location }: NewPlantingPageTwoOutput) => {
    setLocation(location);
    nextPage();
  }, [nextPage]);

  const submitPageThree = useCallback(async ({ initialTimelineEntry }: NewPlantingPageThreeOutput) => {
    const plantingId = crypto.randomUUID();
    await createPlanting({
        id: plantingId,
        name: name!,
        plantId: plant!.id,
        tags: [{type: "area", tag: location.trim() }],
      }, initialTimelineEntry);
    goTo(plantingPage({ plantingId }));
  }, [name, plant, location]);

  if (pageNum === 0) {
    return <NewPlantingPageOne initialSearchText={name ?? ""} onSubmit={submitPageOne} />;
  } else if (pageNum === 1) {
    return <NewPlantingPageTwo plantName={name ?? ""} location={location} onSubmit={submitPageTwo} onBack={prevPage} />;
  } else if (pageNum === 2) {
    return <NewPlantingPageThree plantName={name ?? ""} onSubmit={submitPageThree} onBack={prevPage} />;
  } else {
    return <FailurePage error={new Error(`Unexpected page num ${pageNum}`)} />
  }
}
