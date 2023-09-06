import React from "react";
import { PlantingEntry } from "./entry";
import { PlantingListEntry } from "../api/plantings-list";

interface PlantingListProps {
  plantings: PlantingListEntry[]
}

export function PlantingList({ 
  plantings, 
}: PlantingListProps) {
  const byArea = plantings.reduce((byArea, planting) => {
    const plantArea = planting.tags.find(({type}) => type === "area")?.tag ?? "Other";
    byArea[plantArea] ??= [];
    byArea[plantArea].push(planting);
    return byArea;
  }, {} as Record<string, typeof plantings>);

  return (
    <div className="flex flex-col divide-y">
      {Object.entries(byArea).map(([area, plantings]) => 
        <React.Fragment key={area}>
          <div className="bg-lime-600 p-3 text-xl font-bold">{area}</div>
          {plantings.sort(byDisplayName).map(planting => 
            <PlantingEntry key={planting.id} planting={planting} />)}
        </React.Fragment>
      )}
    </div>
  )
}

function byDisplayName<T extends { name: string }>(a: T, b: T) {
  return a.name.localeCompare(b.name ?? a.name);
}