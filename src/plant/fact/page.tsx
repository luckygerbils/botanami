import React, { useCallback, useState, MouseEvent } from "react";
import { BackButton } from "../../common/back-button";
import { Layout } from "../../common/layout";
import { PlantFactId, PlantId, RequestProps } from "../../types";
import { H1 } from "../../common/h1";
import { SaveIcon, TrashIcon } from "../../common/icons";
import { Button } from "../../common/button";
import { back } from "../../common/link";
import { PlantFactPageProps, deletePlantFact, getPlantFactPageInitialProps, putPlantFact } from "../../api/plant-fact";
import { FactEntryForm, FactEntryFormData } from "./fact-entry-form";

export function editPlantFactPage({ plantId, factId } : { plantId: PlantId, factId?: PlantFactId }): string {
  return `/plant/${plantId}/fact${factId != null ? `?factId=${factId}` : ""}`;
}
export const regexp = /^\/plant\/(?<plantId>[^/]*)\/fact$/;
export async function getInitialProps(requestProps: RequestProps<{ plantId: PlantId }>): Promise<PlantFactPageProps> {
  const { groups: { plantId }, query } = requestProps;
  return await getPlantFactPageInitialProps(plantId, query.get("factId") ?? undefined);
}

export default function EditPlantFactPage({
  plantId,
  fact,
}: PlantFactPageProps) {
  const [ data, setData ] = useState<FactEntryFormData>({
    id: fact?.id ?? crypto.randomUUID(),
    summary: fact?.summary,
    description: fact?.description,
    photos: fact?.photos,
    sourceWebsite: fact?.source?.website,
    sourceUrl: fact?.source?.url,
  });

  const [ { confirming, deleting, error: deleteError }, setDeleteState ] = useState<{confirming?: boolean, deleting?: boolean, error?: Error}>({});

  const saveEntry = useCallback(async () => {
    await putPlantFact(plantId, {
      id: data.id,
      summary: data.summary,
      description: data.description,
      photos: data.photos,
      source: (data.sourceWebsite && data.sourceUrl) ? { website: data.sourceWebsite, url: data.sourceUrl } : undefined,
    });
    back();
  }, [data.description, data.id, data.photos, data.sourceUrl, data.sourceWebsite, data.summary, plantId]);

  const confirmDelete = useCallback(() => setDeleteState({ confirming: true }), []);
  const deleteFact = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDeleteState({ deleting: true });
    try {
      await deletePlantFact(fact!.id);
      back();
    } catch (e) {
      setDeleteState({ error: e instanceof Error ? e : new Error(String(e)) });
    }
  }, [fact]);

  const noInputsGiven = data.summary == null
                && data.description == null
                && data.photos == null
                && (data.sourceUrl == null || data.sourceWebsite == null);

  if (deleteError) {
    console.error(EditPlantFactPage.name, deleteError);
  }
  
  return (
    <Layout 
      button={<BackButton />} 
      header={<H1>Add Fact</H1>}
    >
      <header className="p-3 text-xl">
        New Fact
      </header>
      <div className="px-4 flex flex-col">
        <FactEntryForm data={data} onChange={setData} />

        <Button className="text-2xl mt-2 mb-4" onClick={saveEntry} disabled={noInputsGiven || deleting }>
          <SaveIcon />&nbsp;Save Fact
        </Button>

        {fact != null && (
          <Button variant={confirming ? "danger" : "secondary"} className="text-2xl mb-2" onClick={confirming ? deleteFact : confirmDelete} disabled={deleting}>
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

