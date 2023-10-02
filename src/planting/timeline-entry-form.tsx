import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { Button } from "../common/button";
import { ExpandableImage } from "../common/expandable-image";
import { Photo, TimelineEntryId, TimelineEntryPhoto } from "../types";
import { getExifModifyDate } from "../util/exif";
import { CardTextIcon, ImageIcon, LinkIcon } from "../common/icons";
import { AutosizeTextArea } from "../common/autosize-textarea";
import { Input } from "../common/input";

interface TimelineEntryFormData {
  id: TimelineEntryId,
  date: string,
  summary?: string,
  description?: string,
  photos?: Photo[],
}

interface TimelineEntryFormProps {
  data: TimelineEntryFormData,
  onChange: (data: TimelineEntryFormData) => void,
}

const DateTypes = ["auto", "date", "month", "year"] as const;
type DateType = typeof DateTypes[number];

export function TimelineEntryForm({
  data,
  onChange,
}: TimelineEntryFormProps) {
  const {
    date,
    summary="",
    description="",
    photos=[],
  } = data;

  const [ dateType, setDateType ] = useState<DateType>("auto");

  const dateInput = useRef<HTMLInputElement>(null);
  const showDateInput = useCallback(() => dateInput.current?.showPicker(), []);
  const monthInput = useRef<HTMLInputElement>(null);
  const showMonthInput = useCallback(() => monthInput.current?.showPicker(), []);

  const [ autoDate, setAutoDate ] = useState(date);
  const [ manualDate, setManualDate ] = useState<string|null>(null);

  const changeDateType = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const dateType = e.target.selectedOptions[0].value as DateType;
    if (dateType === "auto") {
      setManualDate(null);
      onChange({ ...data, date: autoDate });
    } else {
      if (manualDate == null && dateType !== "year") {
        // Unfortunately, can't do anything to show the year input automatically
        ({ date: showDateInput, month: showMonthInput })[dateType]();
      }

      const [ manualYear, manualMonth, manualDay ] = manualDate == null ? [] : manualDate.split("-");
      const [ autoYear, autoMonth, autoDay ] = autoDate.split("-");
      const [ year, month, day ] = [manualYear ?? autoYear, manualMonth ?? autoMonth, manualDay ?? autoDay];

      const date = {
          date: `${year}-${month}-${day}`,
          month: `${year}-${month}`,
          year: `${year}`,
        }[dateType];
      setManualDate(date);
      onChange({ ...data, date });
    }
    setDateType(dateType);
  }, [autoDate, data, manualDate, onChange, showDateInput, showMonthInput]);

  const changeDate = useCallback(
    (e: ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
      const date = e.target.value;
      setManualDate(date);
      if (dateType != "auto") {
        onChange({ ...data, date });
      }
    }, [data, dateType, onChange]);

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
    const dateChange: { date?: string, } = {};
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
          const autoDate = exifDate.toISOString().substring(0, 10);
          setAutoDate(autoDate);
          if (dateType === "auto") {
            dateChange.date = autoDate;
          }
        }
      } catch (e) {
        console.log(`Error getting exif modify date. Ignoring. Error: ${String(e)}`);
      }

      newPhotos.push({ id: crypto.randomUUID(), blob: file, timelineEntryId: data.id })
    }
    onChange({ ...data, ...dateChange, photos: [ ...photos, ...newPhotos ]})
  }, [data, dateType, onChange, photos]);

  const [ hasDescription, setHasDescription ] = useState(false);
  const toggleHasDescription = useCallback(() => setHasDescription(value => !value), []);
  
  return (
    <>
      <div className="mb-2">
        <span className="text-zinc-300">Date</span>

        <input type="date" ref={dateInput}
            className="hidden"
            value={manualDate ?? ""}
            onChange={changeDate} />

        <input type="month" ref={monthInput}
            className="hidden"
            value={manualDate ?? ""}
            onChange={changeDate} />
        
        <div className="bg-zinc-800 flex">
          {dateType !== "year" && (
            <div className="text-xl grow mr-2 p-2" onClick={{
              date: showDateInput,
              month: showMonthInput,
              auto: undefined,
            }[dateType]}>
              {dateType === "auto" ? autoDate : manualDate}
            </div>
          )}
          {dateType == "year" && (
            <select 
              value={manualDate ?? new Date().getFullYear()}
              onChange={changeDate}
              className="bg-transparent text-xl grow mr-2 p-2 focus:outline-none appearance-none"
            >
              {Array(new Date().getFullYear() - 1969).fill(null).map((_,i) => <option key={1970+i}>{1970+i}</option>)}
            </select>
          )}
          
          <select
            className="bg-transparent text-xl text-zinc-400 text-right appearance-none focus:outline-none px-4 py-2"
            value={dateType}
            onChange={useCallback((e: ChangeEvent<HTMLSelectElement>) => e.target.blur(), [])}
            onBlur={changeDateType}
          >
            {DateTypes.map(dateType => 
              <option key={dateType} value={dateType}>
                {{
                  auto: "auto",
                  date: "specific date",
                  month: "approx month",
                  year: "approx year",
                }[dateType]}
              </option>)}
          </select>
        </div>
        
      </div>

      <div className="mb-2">
        <label htmlFor="summary" className="text-zinc-300">Summary</label>
        <Input autoFocus id="summary" type="text" className="text-xl" value={summary} onChange={changeSummary} />
      </div>

      {hasDescription && (
        <>
          <label htmlFor="description"className="text-zinc-300">Description</label>
          <AutosizeTextArea autoFocus id="description" className="mb-2" value={description} onChange={changeDescription} />
        </>
      )}

      {photos.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2 mb-2">
          {photos.map(photo => 
            <div key={photo.id} className="w-full h-40">
              <ExpandableImage className="object-cover w-full h-full" photo={photo} />
            </div>)}
        </div>
      )}

      <div className="grid grid-flow-col auto-cols-fr gap-2 mb-2">
        <Button className="p-4" onClick={addPhoto}>
          <input type="file" multiple className="hidden" ref={photoInput} onChange={upload} />
          <ImageIcon size="lg" />
        </Button>
        <Button className="p-4" onClick={toggleHasDescription} variant={hasDescription ? "secondary" : "primary"}>
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