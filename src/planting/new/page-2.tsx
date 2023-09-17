import React from "react";
import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { BackButton } from "../../common/back-button";
import { Button } from "../../common/button";
import { H1 } from "../../common/h1";
import { Layout } from "../../common/layout";
import { Input } from "../../common/input";

export interface NewPlantingPageTwoOutput {
  location: string,
}

interface NewPlantingPageTwoProps {
  plantName: string,
  location: string,
  onSubmit: (props: NewPlantingPageTwoOutput) => void,
  onBack: () => void,
}

export function NewPlantingPageTwo({
  plantName,
  location: initialLocation,
  onSubmit,
  onBack,
}: NewPlantingPageTwoProps) {
  const [ location, setLocation ] = useState(initialLocation);
  const changeLocation = useCallback((e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value), []);

  const submit = useCallback((e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    onSubmit({ location }) 
  }, [location, onSubmit]);

  return (
    <Layout button={<BackButton onClick={onBack} />} header={<H1>{plantName}</H1>}>
      <form className="p-4 flex flex-col h-full" onSubmit={submit}>
        <div className="text-2xl mb-2">
          Where is it?
        </div>
        <Input autoFocus className="text-2xl mb-2" placeholder="Location" value={location} onChange={changeLocation} />

        <Button className="text-xl" type="submit" disabled={location.length === 0}>
          Next
        </Button>
      </form>
    </Layout>
  );
}