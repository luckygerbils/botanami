import React, { useCallback } from "react";
import { PlantFact, PlantFactId, PlantId } from "../types";
import { ExpandableImage } from "../common/expandable-image";
import { Button } from "../common/button";
import { editPlantFactPage } from "./fact/page";

interface FactProps {
  plantId: PlantId,
  fact: PlantFact,
  expanded: boolean,
  onClick: (fact: PlantFactId) => void,
}

export function Fact({
  plantId,
  fact: {
    id: factId,
    summary,
    description,
    photos,
    source,
  },
  onClick,
  expanded,
}: FactProps) {
  const click = useCallback(() => onClick(factId), [factId, onClick]);
  return (
    <div className="p-4 m-2 border-2 border-zinc-700 touch-none"
      onClick={click}
    >
      {summary &&
        <div className="text-xl font-bold mb-2">{summary}</div>}
      {description != null && 
        <div className="text-xl whitespace-pre-line mb-2">{description}</div>}
      {(photos && photos.length > 0) && (
          <div className="grid grid-flow-col auto-cols-1fr gap-4">
            {photos.map(photo =>
              <div key={photo.id} className="w-full h-40">
                <ExpandableImage className="object-cover w-full h-full" photo={photo} />
              </div>)}
          </div>
        )}
      {source != null && (
        <div className="text-xl"><i>Source:</i> <a className="text-blue-400" href={source.url}>{source.website}</a></div>
      )}
      {expanded && (
        <div className="mt-2">
          <Button linkTo={editPlantFactPage({ plantId, factId })}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}