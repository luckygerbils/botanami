import React from "react";
import { ScientificName } from "../common/scientific-name";
import { Link } from "../common/link";
import { plantPage } from "../plant/page";
import { CommonNameList } from "../common/common-name-list";

interface PlantEntryProps {
  plant: {
    id: string,
    scientificName: string,
    commonNames: string[],
  }
}
export function PlantEntry({
  plant: {
    id: plantId,
    scientificName,
    commonNames,
  }
}: PlantEntryProps) {
  return (
    <Link to={plantPage({ plantId })}
        className="p-4 text-xl">
      <div><ScientificName name={scientificName} /></div>
      <div><CommonNameList list={commonNames} /></div>
    </Link>
  )
}