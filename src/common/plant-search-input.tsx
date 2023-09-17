import React, { useState, useCallback, ChangeEvent, useEffect } from "react";
import { Button } from "./button";
import { CommonNameList } from "./common-name-list";
import { ScientificName } from "./scientific-name";
import c from "classnames";
import { PlantSearchMatch, searchPlants } from "../api/plant-search";
import { Input } from "./input";

interface PlantSearchInputProps {
  initialSearchText?: string,
  onSelect: (o: PlantingNameAndPlant) => void
}

export interface PlantingNameAndPlant {
  plant: PlantSearchMatch["plant"],
  name: string,
}

export function PlantSearchInput({
  initialSearchText="",
  onSelect,
}: PlantSearchInputProps) {
  const [ searchText, setSearchText ] = useState(initialSearchText); 
  const changeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value), []);

  const [ plantMatches, setPlantMatches ] = useState<{loading?: boolean, error?: Error, data?: PlantSearchMatch[]}>({ loading: false });

  useEffect(() => {
    void (async () => {
      if (searchText.length > 0) {
        setPlantMatches({ loading: true });
        try {
          setPlantMatches({ data: await searchPlants(searchText) });
        } catch (e) {
          setPlantMatches({ error: e as Error });
        }
      }
    })();
  }, [searchText]);

  return (
    <>
      <Input className="text-2xl p-2 mb-2 w-full" 
        autoFocus 
        placeholder="Plant Name" 
        value={searchText} 
        onChange={changeInput} />
      <div className="divide-y divide-zinc-800">
        {searchText.length > 0 && <>
          {plantMatches.loading && <>Loading...</>}
          {plantMatches.error && <>Error: {plantMatches.error.message}</>}
          {plantMatches.data && <>
            {plantMatches.data.map(plantMatch => 
              <PlantSearchResultEntry key={plantMatch.match} match={plantMatch} onClick={onSelect} />)}
          </>}
        </>}
      </div>
    </>
  )
}

interface PlantSearchResultEntryProps {
  match: PlantSearchMatch,
  onClick: (o: PlantingNameAndPlant) => void,
}

function PlantSearchResultEntry({
  match,
  onClick,
}: PlantSearchResultEntryProps) {
  const click = useCallback(() => onClick({ plant: match.plant, name: match.match }), [onClick, match.plant, match.match]);
  return (
    <div className="p-2 mb-2 flex items-center">
      <div className="flex flex-col">
        <div className={c("text-2xl", { "italic": match.matchType === "scientificName" })}>
          <HighlightedSearchResult match={match.match} matcheIndexes={match.matchIndexes} />
        </div>
        {match.matchType === "commonName" &&
          <div className="text-xl">
            <ScientificName name={match.plant.scientificName} />
          </div>}
          <div className="text-xl">
            <CommonNameList list={match.plant.commonNames.filter(commonName => commonName !== match.match)} />
          </div>
      </div>
      <div className="grow flex justify-end">
          <div><Button onClick={click}>Select</Button></div>
      </div>
    </div>
  );
}

interface HighlightedSearchResultProps {
  match: string,
  matcheIndexes: (readonly [number, number])[],
}
function HighlightedSearchResult({ match, matcheIndexes }: HighlightedSearchResultProps) {
  let lastMatchEndIndex = 0;
  const parts = [];
  for (let i = 0; i < matcheIndexes.length; i++) {
    const [ matchStart, matchEnd ] = matcheIndexes[i]
    parts.push(<React.Fragment key={`fragment${i}`}>{match.substring(lastMatchEndIndex, matchStart)}</React.Fragment>);
    parts.push(<span key={`match${i}`} className="font-bold">{match.substring(matchStart, matchEnd)}</span>);
    lastMatchEndIndex = matchEnd;
  }
  parts.push(<React.Fragment key="lastFragment">{match.substring(lastMatchEndIndex)}</React.Fragment>);
  return (
    <>{parts}</>
  );
}