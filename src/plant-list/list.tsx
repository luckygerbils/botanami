import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { PlantId } from "../types";
import { PlantSearchMatch, searchPlants } from "../api/plant-search";
import { CommonNameList } from "../common/common-name-list";
import { ScientificName } from "../common/scientific-name";
import c from "classnames";
import { Link } from "../common/link";
import { plantPage } from "../plant/page";
import { Spinner } from "../common/spinner";
import { useDebounce } from "../util/debounce";
import { Input } from "../common/input";

interface PlantListProps {
  plants: {
    id: PlantId,
    scientificName: string,
    commonNames: string[],
  }[],
}

export function PlantList({
  plants
}: PlantListProps) {
  const [ searchText, setSearchText ] = useState(""); 
  const changeSearchText = useCallback((e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value), []);

  const [ plantMatches, setPlantMatches ] = useState<{loading?: boolean, error?: Error, data?: PlantSearchMatch[]}>({ loading: false });

  const search = useDebounce(async (searchText: string) => {
      if (searchText.length > 0) {
        setPlantMatches({ loading: true });
        try {
          setPlantMatches({ data: await searchPlants(searchText) });
        } catch (e) {
          setPlantMatches({ error: e as Error });
        }
      } else {
        setPlantMatches({ loading: false });
      }
    }, 300);

  useEffect(() => {
    void search(searchText);
  }, [search, searchText]);

  const matching = Boolean(plantMatches.loading) || plantMatches.error != null || plantMatches.data != null

  return (
    <>
      <label className="mx-4 mt-4">
        <Input type="text" className="text-xl" placeholder="Search" autoFocus 
          value={searchText} onChange={changeSearchText} />
      </label>
      {!matching && (
        <div className="flex flex-col divide-y divide-zinc-500">
          {plants.map(({id: plantId, scientificName, commonNames}) => (
            <Link key={plantId} to={plantPage({ plantId })}
                className="p-4 text-xl">
              <div><ScientificName name={scientificName} /></div>
              <div><CommonNameList list={commonNames} /></div>
            </Link>
          ))}
        </div>
      )}
      {matching && <>
        {plantMatches.loading && 
          <div className="grow flex flex-col items-center justify-center">
            <div className="mb-2"><Spinner size="lg"/></div>
            <div className="text-xl">Loading...</div>
          </div>}
        {plantMatches.error && <>Error: {plantMatches.error.message}</>}
        {plantMatches.data && <>
          {plantMatches.data.map(plantMatch => 
            <PlantSearchResultEntry key={plantMatch.match} match={plantMatch} />)}
        </>}
      </>}
    </>
  )
}

interface PlantSearchResultEntryProps {
  match: PlantSearchMatch,
}

function PlantSearchResultEntry({
  match,
}: PlantSearchResultEntryProps) {
  return (
    <Link className="p-4 text-xl" to={plantPage({plantId: match.plant.id})}>
      <div className="flex flex-col">
        <div className={c({ "italic": match.matchType === "scientificName" })}>
          <HighlightedSearchResult match={match.match} matchIndexes={match.matchIndexes} />
        </div>
        <div className="text-xl">
          <CommonNameList list={match.plant.commonNames.filter(commonName => commonName !== match.match)} />
        </div>
        {match.matchType === "commonName" &&
          <div>
            <ScientificName name={match.plant.scientificName} />
          </div>}
      </div>
    </Link>
  );
}

interface HighlightedSearchResultProps {
  match: string,
  matchIndexes: (readonly [number, number])[],
}
function HighlightedSearchResult({ match, matchIndexes: matcheIndexes }: HighlightedSearchResultProps) {
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