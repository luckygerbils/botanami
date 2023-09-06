import React, { useCallback, useState, ChangeEvent } from "react";
import { Layout } from "../../common/layout";
import { BackButton } from "../../common/back-button";
import { H1 } from "../../common/h1";
import { FactEntryForm, FactEntryFormData } from "../fact/fact-entry-form";
import { Button } from "../../common/button";
import { SaveIcon } from "../../common/icons";
import { createPlant } from "../../api/plant";
import { back, goTo } from "../../common/link";
import { RequestProps } from "../../types";

export function newPlantPage(): string {
  return `/new-plant`;
}
export const regexp = /^\/new-plant$/;
export async function getInitialProps(requestProps: RequestProps<Record<string, never>>): Promise<NewPlantPageProps> {
  return {
    returnUrl: requestProps.query.get("returnUrl") ?? undefined,
  };
}

interface NewPlantPageProps {
  returnUrl?: string,
}
 
export default function NewPlantPage({
  returnUrl,
}: NewPlantPageProps) {
  const [ commonNames, setCommonNames ] = useState<string[]>([]);
  const changeCommonNames = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCommonNames(e.target.value.split(",").map(s => s.trimStart()));
  }, []);
  const [ scientificName, setScientificName ] = useState("");
  const changeScientificName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setScientificName(e.target.value);
  }, []);

  const [ initialFact, setInitialFact ] = useState<FactEntryFormData|undefined>();
  const addInitialFact = useCallback(() => setInitialFact({
    id: crypto.randomUUID(),
  }), []);

  const save = useCallback(async () => {
    await createPlant({ id: crypto.randomUUID(), scientificName, commonNames }, initialFact);
    if (returnUrl) {
      goTo(returnUrl);
    } else {
      back();
    }
  }, [commonNames, initialFact, returnUrl, scientificName]);

  return (
    <Layout 
      title="New Plant"
      button={<BackButton />} 
      header={<H1>New Plant</H1>}
    >
      <section className="px-4 mt-2">
        <div className="mb-2">
          <div className="text-xl">Common Names</div>
          <input type="text" autoFocus className="border-2 p-2 w-full" placeholder="(comma separated)" 
            value={commonNames.join(", ")} onChange={changeCommonNames} />
        </div>
        <div className="mb-2">
          <div className="text-xl">Scientific Name</div>
          <input type="text" autoFocus className="border-2 p-2 w-full" placeholder="(optional)"
            value={scientificName} onChange={changeScientificName} />
        </div>
        {initialFact == null && (
          <Button className="text-xl" onClick={addInitialFact}>Add facts</Button>
        )}
        {initialFact != null && (
          <>
            <div className="mb-2">
              <div className="text-xl">Initial facts</div>
            </div>
            <FactEntryForm data={initialFact} onChange={setInitialFact} />
          </>
        )}
        <Button floating variant="save" onClick={save}>
          <SaveIcon /> <span className="sr-only">Save</span>
        </Button>
      </section>
    </Layout>
  )
}