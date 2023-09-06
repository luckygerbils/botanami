import React from "react";
import { useState, useCallback, MouseEvent } from "react";
import { BackButton } from "../../common/back-button";
import { Button } from "../../common/button";
import { H1 } from "../../common/h1";
import { Layout } from "../../common/layout";
import { TimelineEntry } from "../../types";
import { TimelineEntryForm } from "../timeline-entry-form";

export interface NewPlantingPageThreeOutput {
  initialTimelineEntry?: TimelineEntry
}

interface NewPlantingPageThreeProps {
  plantName: string,
  onSubmit: (output: NewPlantingPageThreeOutput) => void,
  onBack: () => void,
}

export function NewPlantingPageThree({
  plantName,
  onSubmit,
  onBack,
}: NewPlantingPageThreeProps) {
  const [ entry, setEntry ] = useState<TimelineEntry>({
    id: crypto.randomUUID(),
    date: new Date(),
    summary: "Planted",
  });

  const submit = useCallback((e: MouseEvent<HTMLButtonElement>) => { 
    e.preventDefault(); 
    onSubmit({ initialTimelineEntry: entry }) 
  }, [entry, onSubmit]);

  const skipAndSubmit = useCallback((e: MouseEvent<HTMLButtonElement>) => { 
    e.preventDefault(); 
    onSubmit({});
  }, [onSubmit]);

  const submitDisabled = entry.summary == null
                && entry.description == null
                && entry.photos == null;

  return (
    <Layout button={<BackButton onClick={onBack} />} header={<H1>{plantName}</H1>}>
      <div className="p-4 flex flex-col h-full">
        <div className="text-2xl mb-2">
          Add initial timeline entry
        </div>
        
        <div className="mb-2">
          <TimelineEntryForm data={entry} onChange={setEntry} />
        </div>

        <Button className="text-2xl mb-2" disabled={submitDisabled} onClick={submit}>
          Submit
        </Button>

        <Button variant="secondary" className="text-2xl" onClick={skipAndSubmit}>
          Skip and Submit
        </Button>
      </div>
    </Layout>
  );
}