import React, { useCallback, useState } from "react";
import { EditPlantingPageProps, getEditPlantingPageInitialProps, deletePlanting } from "../../api/edit-planting";
import { BackButton } from "../../common/back-button";
import { Button } from "../../common/button";
import { CommonNameList } from "../../common/common-name-list";
import { H1 } from "../../common/h1";
import { TrashIcon } from "../../common/icons";
import { Layout } from "../../common/layout";
import { back } from "../../common/link";
import { ScientificName } from "../../common/scientific-name";
import { RequestProps, PlantingId } from "../../types";
import { changePlantPage } from "./plant/page";

export const regexp = /^\/planting\/(?<plantingId>[^/]*)\/edit$/;
export async function getInitialProps(requestProps: RequestProps<{ plantingId: PlantingId }>): Promise<EditPlantingPageProps> {
  const { groups: { plantingId } } = requestProps;
  return await getEditPlantingPageInitialProps(plantingId);
}

export function editPlantingPage({ plantingId }: { plantingId: string }): string {
  return `/planting/${plantingId}/edit`;
}

export default function EditPlantingPage({
  plantingDetails: {
    id: plantingId,
    name,
  },
  plantDetails: {
    scientificName,
    commonNames,
  }
}: EditPlantingPageProps) {
  const [ confirmingDelete, setConfirmingDelete ] = useState(false);
  const confirmDelete = useCallback(() => setConfirmingDelete(true), []);
  const doDelete = useCallback(async () => {
    await deletePlanting(plantingId);
    back(2);
  }, [plantingId]);
  
  return (
    <Layout 
        title={`Edit: ${name}`}
        button={<BackButton />} 
        header={<H1>Edit: {name}</H1>}
    >
      <section className="mb-2">
        <div className="px-4">
          <div className="mb-2">
            {scientificName && 
              <ScientificName name={scientificName} />}
            <div className="text-xl italic">
              <CommonNameList list={commonNames} />
            </div>
          </div>
          <Button linkTo={changePlantPage({ plantingId })} className="text-2xl">
            Change Plant
          </Button>
        </div>
      </section>
      <div className="text-2xl px-4">
        <Button variant={confirmingDelete ? "danger" : "secondary"} onClick={confirmingDelete ? doDelete : confirmDelete}>
            {confirmingDelete ? <><TrashIcon />&nbsp;Are you sure?</> : <><TrashIcon />&nbsp;Delete</>}
        </Button>
      </div>
    </Layout>
  )
}