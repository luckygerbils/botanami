import React, { ChangeEvent, useCallback, useRef } from "react";
import { Photo, PlantFactId } from "../../types";
import { Button } from "../../common/button";
import { ExpandableImage } from "../../common/expandable-image";
import { ImageIcon } from "../../common/icons";
import { getExifModifyDate } from "../../util/exif";
import { Input } from "../../common/input";
import { AutosizeTextArea } from "../../common/autosize-textarea";

export interface FactEntryFormData {
  id: PlantFactId,
  summary?: string,
  description?: string,
  photos?: Photo[],
  sourceWebsite?: string,
  sourceUrl?: string,
}

interface FactEntryFormProps {
  data: FactEntryFormData,
  onChange: (data: FactEntryFormData) => void,
}


export function FactEntryForm({ 
  data,
  onChange 
}: FactEntryFormProps) {
  const {
    summary="",
    description="",
    photos=[],
    sourceWebsite = "",
    sourceUrl = "",
  } = data;

  const changeSummary = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const summary = e.target.value;
      onChange({ ...data, summary: summary.length > 0 ? summary : undefined });
    }, [data, onChange]);
  const changeDescription = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const description = e.target.value;
      onChange({ ...data, description: description.length > 0 ? description : undefined });
    }, [data, onChange]);
  const changeSourceWebsite = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const sourceWebsite = e.target.value;
      onChange({ ...data, sourceWebsite: sourceWebsite.length > 0 ? sourceWebsite : undefined });
    }, [data, onChange]);
  const changeSourceUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const sourceUrl = e.target.value;
      onChange({ ...data, sourceUrl: sourceUrl.length > 0 ? sourceUrl : undefined });
      }, [data, onChange]);

  const photoInput = useRef<HTMLInputElement>(null);
  const addPhotoClick = useCallback(() => {
    if (photoInput.current != null) {
      photoInput.current.click();
    }
  }, [photoInput]);

  const upload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    for (const file of Array.from(e.target.files ?? [])) {
      // Check if the file is an image.
      if (file.type && file.type.indexOf('image') === -1) {
        console.log('File is not an image.', file.type, file);
        return;
      }
      onChange({ ...data, photos: [ ...photos, { id: crypto.randomUUID(), blob: file, plantFactId: data.id } ] })
    }
  }, [data, onChange, photos]);

  return (
    <>
      <div className="mb-2">
        <label htmlFor="summary">Summary</label>
        <Input type="text" id="summary" 
          className="text-xl" 
          placeholder="(optional)"
          value={summary ?? ""}
          onChange={changeSummary} />
      </div>

      <div className="mb-2">
        <label htmlFor="description">Description</label>
        <AutosizeTextArea id="description" 
          className="text-xl" 
          placeholder="(optional)"
          value={description ?? ""}
          onChange={changeDescription} />
      </div>

      <div className="mb-2">
        {photos != null && photos.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2">
            {photos.map(({ id, blob }) => 
              <div key={id} className="w-full h-40">
                <ExpandableImage className="object-cover w-full h-full" src={URL.createObjectURL(blob)} />
              </div>)}
          </div>
        )}

        <input type="file" multiple className="hidden" ref={photoInput} onChange={upload} />
        <Button className="text-2xl" onClick={addPhotoClick}>
          <ImageIcon />&nbsp;Add Photo
        </Button>
      </div>

      <div className="mb-2">
        <label htmlFor="s">Source Website</label>
        <Input id="sourceWebsite" 
          className="text-xl" 
          placeholder="(optional)"
          value={sourceWebsite ?? ""}
          onChange={changeSourceWebsite} />
      </div>
      <div className="mb-2">
        <label htmlFor="s">Source URL</label>
        <Input id="sourceUrl" 
          className="text-xl" 
          placeholder="(optional)"
          value={sourceUrl ?? ""}
          onChange={changeSourceUrl} />
      </div>
    </>
  )
}