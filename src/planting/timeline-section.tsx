import React, {  } from "react";
import { PhotoId, PlantingId, TimelineEntryId } from "../types";
import { Button } from "../common/button";
import { CalendarIcon, CalendarPlusIcon } from "../common/icons";
import { dateCompare, reversed } from "../util/sorting";
import { TimelineEntry } from "./timeline-entry";
import { timelineEntryPage } from "./timeline/page";

interface TimelineSectionProps {
  plantingId: PlantingId,
  timeline: {
    id: TimelineEntryId,
    date: string,
    summary?: string,
    description?: string,
    photos?: {
      id: PhotoId,
      blob: Blob,
    }[],
  }[],
}

export function TimelineSection({
  plantingId,
  timeline,
}: TimelineSectionProps) {  
  return (
    <section>
      <header className="text-2xl py-2 px-4 bg-black mb-2 font-bold flex items-center">
        <CalendarIcon />&nbsp;Timeline
      </header>
      <div className="px-4">
        {timeline.length > 0 && (
          <>
            <Button className="mb-2 text-2xl" linkTo={timelineEntryPage({ plantingId })}>
              <CalendarPlusIcon />&nbsp;Add Entry
            </Button>
            <div className="mb-2 divide-y divide-zinc-800">
              {timeline
                .sort(reversed((a, b) => a.date.localeCompare(b.date)))
                .map(entry => 
                  <TimelineEntry key={entry.id} plantingId={plantingId} entry={entry} />
                )}
            </div>
          </>
        )}
        {timeline.length === 0 && (
          <>
            <div className="text-2xl p-16 rounded text-center m-4">
              <CalendarIcon /><br />
              No entries yet
            </div>
            <Button className="mb-2 text-2xl" linkTo={timelineEntryPage({ plantingId })}>
              <CalendarPlusIcon />&nbsp;Add Entry
            </Button>
          </>
        )}
      </div>
    </section>
  );
}