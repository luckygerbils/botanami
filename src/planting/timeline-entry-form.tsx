import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { Button } from "../common/button";
import { ExpandableImage } from "../common/expandable-image";
import { Photo, TimelineEntryId, TimelineEntryPhoto } from "../types";
import { getExifModifyDate } from "../util/exif";
import { CardTextIcon, ImageIcon, LinkIcon } from "../common/icons";
import { AutosizeTextArea } from "../common/autosize-textarea";

interface TimelineEntryFormData {
  id: TimelineEntryId,
  date: Date,
  summary?: string,
  description?: string,
  photos?: Photo[],
}

interface TimelineEntryFormProps {
  data: TimelineEntryFormData,
  onChange: (data: TimelineEntryFormData) => void,
}

export function TimelineEntryForm({
  data,
  onChange,
}: TimelineEntryFormProps) {
  const {
    summary="",
    description="",
    photos=[],
  } = data;

  const dateInput = useRef<HTMLInputElement>(null);
  const [ autoDate, setAutoDate ] = useState(new Date().toISOString().substring(0, 10));
  const [ useAutoDate, setUseAutoDate ] = useState(true);
  const [ manualDate, setManualDate ] = useState<string|null>(null);
  const chooseDate = useCallback(() => dateInput.current?.showPicker(), []);
  const unchooseDate = useCallback(() => setUseAutoDate(true), []);
  const changeDate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setManualDate(e.target.value);
      setUseAutoDate(false);
    }, []);
  
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

  const photoInput = useRef<HTMLInputElement>(null);
  const addPhoto = useCallback(() => {
    if (photoInput.current != null) {
      photoInput.current.click();
    }
  }, [photoInput]);

  const upload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const newPhotos: Photo[] = [];
    for (const file of Array.from(e.target.files ?? [])) {
      // Check if the file is an image.
      if (file.type && file.type.indexOf('image') === -1) {
        console.log('File is not an image.', file.type, file);
        return;
      }

      // Set the timeline date based on the photo date if available
      try {
        const exifDate = await getExifModifyDate(file);
        if (exifDate != null) {
          setAutoDate(exifDate.toISOString().substring(0, 10));
        }
      } catch (e) {
        console.log(`Error getting exif modify date. Ignoring. Error: ${String(e)}`);
      }

      newPhotos.push({ id: crypto.randomUUID(), blob: file, timelineEntryId: data.id })
    }
    onChange({ ...data, photos: [ ...photos, ...newPhotos ]})
  }, [data, onChange, photos]);

  const [ hasDescription, setHasDescription ] = useState(false);
  const toggleHasDescription = useCallback(() => setHasDescription(value => !value), []);
  
  return (
    <>
      <div className="mb-2">
        Date
        <div className="flex mr-2">
          <input type="date" ref={dateInput}
            className="hidden"
            value={manualDate ?? ""}
            onChange={changeDate} />
          <div className="border-2 p-2 text-xl grow mr-2 ">
            {useAutoDate ? autoDate : manualDate}{useAutoDate && <span className="text-slate-400"> (auto)</span>}
          </div>
          <Button variant="link" className="w-auto" onClick={useAutoDate ? chooseDate : unchooseDate}>
            {useAutoDate ? "override" : "use auto"}
          </Button>
        </div>
      </div>

      <div className="mb-2">
        <label htmlFor="summary">Summary</label>
        <input autoFocus id="summary" type="text" className="w-full border-2 text-xl p-2" value={summary} onChange={changeSummary} />
      </div>

      {hasDescription && (
        <>
          <label htmlFor="description">Description</label>
          <AutosizeTextArea autoFocus id="description" className="border-2 p-2 mb-2" value={description} onChange={changeDescription} />
        </>
      )}

      {photos.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2 mb-2">
          {photos.map(({ id, blob }) => 
            <div key={id} className="w-full h-40">
              <ExpandableImage className="object-cover w-full h-full" src={URL.createObjectURL(blob)} />
            </div>)}
        </div>
      )}

      <div className="grid grid-flow-col auto-cols-fr gap-2 mb-2">
        <Button className="border-2 p-4" onClick={addPhoto}>
          <input type="file" multiple className="hidden" ref={photoInput} onChange={upload} />
          <ImageIcon size="lg" />
        </Button>
        <Button className="border-2 p-4" onClick={toggleHasDescription} variant={hasDescription ? "secondary" : "primary"}>
          <CardTextIcon size="lg" />
        </Button>
      </div>
    </>
  );
}

function formatDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}