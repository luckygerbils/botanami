import React, { useCallback, useState, MouseEvent } from "react";
import { BackButton } from "../../common/back-button";
import { SaveIcon, TrashIcon } from "../../common/icons";
import { Layout } from "../../common/layout";
import { PlantingId, RequestProps, TimelineEntry, TimelineEntryId } from "../../types";
import { Button } from "../../common/button";
import { TimelineEntryForm } from "../timeline-entry-form";
import { H1 } from "../../common/h1";
import { back } from "../../common/link";
import { TimelineEntryPageProps, getTimelineEntryPageInitialProps, putTimelineEntry, deleteTimelineEntry } from "../../api/timeline-entry";

export function timelineEntryPage({ plantingId, timelineEntryId }: { plantingId: PlantingId, timelineEntryId?: TimelineEntryId }): string {
  return `/planting/${plantingId}/timeline${timelineEntryId != null ? `?timelineEntryId=${timelineEntryId}` : ""}`;
}
export const regexp = /^\/planting\/(?<plantingId>[^/]*)\/timeline$/;
export async function getInitialProps(requestProps: RequestProps<{ plantingId: PlantingId }>): Promise<TimelineEntryPageProps> {
  const { groups: { plantingId }, query } = requestProps;
  return await getTimelineEntryPageInitialProps(plantingId, query.get("timelineEntryId") ?? undefined);
}

export default function NewTimelineEntryPage({
  plantingId,
  plantingName,
  timelineEntry,
}: TimelineEntryPageProps) {
  const [ entry, setEntry ] = useState<TimelineEntry>({
    id: timelineEntry?.id ?? crypto.randomUUID(),
    date: timelineEntry?.date ?? new Date().toISOString().substring(0, 10),
    summary: timelineEntry?.summary,
    description: timelineEntry?.description,
    photos: timelineEntry?.photos,
  });

  const saveEntry = useCallback(async () => {
    await putTimelineEntry(plantingId, entry);
    back();
  }, [entry, plantingId]);

  const [ { confirming, deleting, error: deleteError }, setDeleteState ] = useState<{confirming?: boolean, deleting?: boolean, error?: Error}>({});

  const confirmDelete = useCallback(() => setDeleteState({ confirming: true }), []);
  const deleteEntry = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDeleteState({ deleting: true });
    try {
      await deleteTimelineEntry(timelineEntry!.id);
      back();
    } catch (e) {
      setDeleteState({ error: e instanceof Error ? e : new Error(String(e)) });
    }
  }, [timelineEntry]);

  const saveDisabled = entry.summary == null && entry.photos == null;
  
  return (
    <Layout 
      button={<BackButton href={`/planting/${plantingId}`} />} 
      header={<H1>New Timeline Entry</H1>}
    >
      <header className="p-3 text-xl">
        {timelineEntry != null ? `Edit Timeline Entry for ${plantingName}` : `New Timeline Entry for ${plantingName}`}
      </header>
      <div className="px-4 flex flex-col">
        <TimelineEntryForm data={entry} onChange={setEntry} />

        <Button floating variant="save" className="text-2xl mt-4 mb-2" onClick={saveEntry} disabled={saveDisabled}>
          <SaveIcon /><span className="sr-only">Save Entry</span>
        </Button>

        {timelineEntry != null && (
          <Button variant={confirming ? "danger" : "secondary"} className="text-2xl mb-2" onClick={confirming ? deleteEntry : confirmDelete} disabled={deleting}>
            {confirming ? <><TrashIcon />&nbsp;Are you sure?</> : <><TrashIcon />&nbsp;Delete</>}
          </Button>
        )}

        {deleteError && (
          <div className="bg-red-100 p-2">
            Error: {deleteError.message}
          </div>
        )}
      </div>
    </Layout>
  )
}

