import React, { useCallback, useState, MouseEvent } from "react";
import { ExpandableImage } from "../common/expandable-image";
import { PhotoId, PlantingId, TimelineEntry } from "../types";
import { Button } from "../common/button";
import { timelineEntryPage } from "./timeline/page";

interface TimelineEntryProps {
  plantingId: PlantingId,
  entry: {
    id: string,
    date: Date,
    summary?: string,
    description?: string,
    photos?: {
      id: PhotoId,
      blob: Blob,
    }[],
  }
}

export function TimelineEntry({
  plantingId,
  entry: {
    id: timelineEntryId,
    summary,
    date,
    photos,
    description,
  }
}: TimelineEntryProps) {
  const [ menuVisible, setMenuVisible ] = useState(false);

  const showMenu = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMenuVisible(visible => !visible);
  }, []);

  return (
    <div className="mb-2">
      <div onClick={showMenu} className="p-2">
        <div className="flex">
          {summary &&
            <div className="text-xl">{summary}</div>}
          <div className="grow flex justify-end items-start">
            {date.toLocaleDateString(undefined, { dateStyle: "full" })}
          </div>
        </div>
        {(photos && photos.length > 0) && (
          <div className="grid grid-cols-3 gap-2">
          {photos.map(photo =>
            <div key={photo.id} className="w-full h-40">
              <ExpandableImage className="object-cover w-full h-full" photo={photo} />
            </div>)}
          </div>
        )}
        {description && (
          <div className="whitespace-pre-line">
            {description}
          </div>
        )}
      </div>
      {menuVisible && (
        <div className="m-2">
          <Button linkTo={timelineEntryPage({ plantingId, timelineEntryId })}>
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}