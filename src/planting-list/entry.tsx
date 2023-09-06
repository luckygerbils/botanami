import React from "react";
import { Photo, Planting } from "../types";
import { ScientificName } from "../common/scientific-name";
import { dateCompare, reversed } from "../util/sorting";
import { Link } from "../common/link";
import { plantingPage } from "../planting/page";

interface PlantingEntryProps {
  planting: {
    id: string,
    name: string,
    plant: {
      scientificName: string,
    }
  }
}
export function PlantingEntry({
  planting: {
    id: plantingId,
    name,
    plant,
    // timeline,
  }
}: PlantingEntryProps) {
  // const latestPhoto: Photo|undefined = timeline
  //   ?.sort(reversed((a, b) => dateCompare(a.date, b.date)))
  //   .find(({ photos }) => photos != null && photos.length > 0)?.photos?.[0];
  return (
    <Link to={plantingPage({ plantingId })}
        className="p-4 text-xl grid grid-cols-[2fr_1fr]">
      <div>
        <div>{name}</div>
        {plant.scientificName != name && <div><ScientificName name={plant.scientificName} /></div>}
      </div>
      {/* {latestPhoto && (
        <div className="bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: `url(${URL.createObjectURL(latestPhoto.blob)})`
        }} />
      )} */}
    </Link>
  )
}