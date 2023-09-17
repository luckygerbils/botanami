import React, { useCallback, useState, useRef, MouseEvent } from "react";
import { BackButton } from "../common/back-button";
import { Layout } from "../common/layout";
import { PlantFactId, PlantId, RequestProps } from "../types";
import { H1 } from "../common/h1";
import { ScientificName } from "../common/scientific-name";
import { CommonNameList } from "../common/common-name-list";
import { CardTextIcon, ImageIcon, LinkIcon, PlusIcon } from "../common/icons";
import { Button } from "../common/button";
import { Fact } from "./fact";
import { editPlantFactPage } from "./fact/page";
import { PlantPageProps, getPlantPageInitialProps } from "../api/plant";

export function plantPage({ plantId } : { plantId: PlantId }): string {
  return `/plant/${plantId}`;
}
export const regexp = /^\/plant\/(?<plantId>[^/]*)$/;
export async function getInitialProps(requestProps: RequestProps<{ plantId: PlantId }>): Promise<PlantPageProps> {
  const { groups: { plantId } } = requestProps;
  return getPlantPageInitialProps(plantId);
}
 
export default function PlantPage({
  id: plantId,
  scientificName,
  commonNames,
  facts,
}: PlantPageProps) {
  const [ expandedFactId, setExpandedFactId ] = useState<PlantFactId|null>(null);
  const factSection = useRef<HTMLElement>(null);
  const closeExpandedFact = useCallback((e: MouseEvent<HTMLElement>) => {
    if (e.target === factSection.current) {
      setExpandedFactId(null);
    }
  }, []);
  
  return (
    <Layout 
      title={scientificName}
      button={<BackButton />} 
      header={<H1><ScientificName name={scientificName} /></H1>}
    >
      <section className="mb-2">
        <header className="text-2xl py-2 px-4 bg-black mb-2 font-bold">Common Names</header>
        <div className="px-4 text-xl">
          <CommonNameList list={commonNames} />
        </div>
      </section>
      <section onClick={closeExpandedFact} ref={factSection} className="grow">
        <header className="flex mb-2 bg-black items-center">
          <div className="grow text-2xl py-2 px-4 font-bold">Facts</div>
          {facts.length > 0 && (
            <div className="flex items-center justify-end">
              <Button className="w-auto mr-4" variant="link" linkTo={editPlantFactPage({ plantId })}>
                <PlusIcon /> Add Fact
              </Button>
            </div>
          )}
        </header>
        {facts.length > 0 && (
          <div className="flex flex-col flex-wrap">
            {facts.map((fact, i) => (
              <Fact key={i} plantId={plantId} fact={fact} expanded={expandedFactId === fact.id} onClick={setExpandedFactId} />
            ))}
          </div>
        )}
        {facts.length === 0 && (
          <div className="px-4">
            <div className="text-2xl p-16 rounded text-center m-4">
              No facts yet
            </div>
            <Button className="mb-2 text-2xl" linkTo={editPlantFactPage({ plantId })}>
              <PlusIcon />&nbsp;Add Fact
            </Button>
          </div>
        )}
      </section>
    </Layout>
  )
}

