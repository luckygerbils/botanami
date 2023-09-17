import React, { MouseEvent, useCallback, useState } from "react";
import { PlantingEntry } from "./entry";
import { PlantingListEntry } from "../api/plantings-list";
import c from "classnames";

interface PlantingListProps {
  plantings: PlantingListEntry[]
}
type GroupFn = (list: PlantingListEntry[]) => Record<string, PlantingListEntry[]>;

export function PlantingList({ 
  plantings, 
}: PlantingListProps) {
  const [ groupMethod, setGroupMethod ] = useState<keyof typeof GROUP_FNS|"noGroup">("byArea");

  const grouped = GROUP_FNS[groupMethod](plantings);

  return (
    <>
      <div className="flex p-2">
        <GroupButton value="noGroup" groupMethod={groupMethod} onClick={setGroupMethod}>All</GroupButton>
        <GroupButton value="byArea" groupMethod={groupMethod} onClick={setGroupMethod}>By Area</GroupButton>
      </div>
      <div className="flex flex-col">
        {Object.entries(grouped)
          .map(([groupName, plantings]) => 
            <React.Fragment key={groupName}>
              <div className="bg-zinc-800 p-3 text-xl font-bold">{groupName}</div>
              <div className="divide-y divide-dark-500">
                {plantings.sort(byDisplayName).map(planting => 
                  <PlantingEntry key={planting.id} planting={planting} />)}
              </div>
            </React.Fragment>
          )}
      </div>
    </>
  )
}

interface GroupButtonProps {
  value: GroupMethod,
  groupMethod: GroupMethod,
  onClick: (g: GroupMethod) => void,
}

function GroupButton({
  value,
  groupMethod,
  onClick,
  children,
}: React.PropsWithChildren<GroupButtonProps>) {
  const click = useCallback(() => onClick(value), [onClick, value]);
  return (
    <button 
      className={c(
        "p-1 text-lg border-2 mr-2 no-tap-highlight", 
        value == groupMethod ? "border-zinc-700 bg-zinc-700" : "border-zinc-800"
      )}
      onClick={click}
    >
      {children}
    </button>
  );
}

const GROUP_FNS = {
  byArea(plantings: PlantingListEntry[]) {
    return plantings.reduce((byArea, planting) => {
      const plantArea = planting.tags.find(({type}) => type === "area")?.tag ?? "Other";
      byArea[plantArea] ??= [];
      byArea[plantArea].push(planting);
      return byArea;
    }, {} as Record<string, typeof plantings>);
  },
  noGroup(plantings: PlantingListEntry[]) {
    return { "All Plantings": plantings };
  }
 };
type GroupMethod = keyof typeof GROUP_FNS;

function byDisplayName<T extends { name: string }>(a: T, b: T) {
  return a.name.localeCompare(b.name ?? a.name);
}