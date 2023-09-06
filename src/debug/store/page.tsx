import React, { useCallback, MouseEvent, useState } from "react";
import { H1 } from "../../common/h1";
import { Layout } from "../../common/layout";
import { getDb } from "../../db";
import { RequestProps } from "../../types";
import { BackButton } from "../../common/back-button";
import { toPromise } from "../../db/util";
import c from "classnames";

export function debugStorePage({ storeName }: { storeName: string }): string {
  return  `/debug/store/${storeName}`;
}
export const regexp = /^\/debug\/store\/(?<storeName>[^/]*)$/;
export async function getInitialProps(requestProps: RequestProps<{ storeName: string }>): Promise<DebugStorePageProps> {
  const db = await getDb();
  const storeName = requestProps.groups.storeName;

  if (!db.objectStoreNames.contains(storeName)) {
    throw new Error(`Store ${storeName} not found`);
  }

  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const entries = await toPromise(store.getAll());
  const keyPath = store.keyPath;
  return {
    storeName,
    entries,
    keyPath: Array.isArray(keyPath) ? keyPath : [keyPath],
  };
}

interface DebugStorePageProps {
  storeName: string,
  entries: unknown[],
  keyPath: string[],
}
export default function DebugStorePage({ 
  storeName,
  entries,
  keyPath,
}: DebugStorePageProps) {
  const keys = Array.from(entries.map(entry => Object.keys(entry as object))
    .reduce((keys, entryKeys) => { entryKeys.forEach(key => keys.add(key)); return keys; }, new Set<string>()));
  
  const [ selected, setSelected ] = useState<Set<IDBValidKey>>(new Set());
  const select = useCallback((key: IDBValidKey, isSelected: boolean) => {
    setSelected(selected => {
      const result = new Set(selected);
      if (isSelected) {
        result.add(key);
      } else {
        result.delete(key);
      }
      return result;
    });
  }, []);

  const [ deleted, setDeleted ] = useState<Set<IDBValidKey>>(new Set());
  const [ { confirming }, setState ] = useState({ confirming: false });
  const confirm = useCallback(() => setState({ confirming: true }), []);
  const deleteSelected = useCallback(async () => {
    const db = await getDb();
    const transaction = db.transaction(storeName, "readwrite");
    for (const key of selected) {
      transaction.objectStore(storeName).delete(key);
    }
    setDeleted(deleted => new Set([...deleted, ...selected]));
    setSelected(new Set());
    setState({ confirming: false });
  }, [selected, storeName]);

  const filteredEntriesWithKeys = entries
    .map(entry => {
      const entryKey = keyPath.reduce((obj, key) => (obj as Record<string, unknown>)[key], entry) as IDBValidKey;
      return [entryKey, entry] as const;
    })
    .filter(([key, entry]) => !deleted.has(key))

  return (
    <Layout
      button={<BackButton />} 
      header={<H1>Debug - {storeName}</H1>}
    >
      {filteredEntriesWithKeys.length === 0 && (
        <div className="text-xl p-3 text-center">
          No entries
        </div>
      )}
      {filteredEntriesWithKeys.length > 0 && 
        <>
          <table className="mb-2">
            <thead>
              <tr className="bg-slate-200">
                <td></td>
                {keys.map(key => <th key={key} className="p-1 border-r-2">{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredEntriesWithKeys.map(([entryKey, entry], row) =>
                <EntryRow key={row} entry={entry} entryKey={entryKey} keys={keys} selected={selected.has(entryKey)} onSelect={select} />)}
            </tbody>
          </table>
          <button 
              className={c("text-xl bg-red-300 p-2 disabled:bg-slate-300", {"bg-red-800 text-white": confirming} )}
              onClick={confirming ? deleteSelected : confirm}
              disabled={selected.size === 0}>
            {confirming ? <>Are you sure?</> : <>Delete</>}
          </button>  
        </>}
    </Layout>
  )
}

interface EntryRowProps {
  keys: string[],
  entry: unknown,
  entryKey: IDBValidKey,
  selected: boolean,
  onSelect: (key: IDBValidKey, selected: boolean) => void,
}
function EntryRow({
  keys,
  entry,
  entryKey,
  onSelect,
}: EntryRowProps) {
  const click = useCallback((e: MouseEvent<HTMLInputElement>) => {
    onSelect(entryKey, e.currentTarget.checked);
  }, [entryKey, onSelect]);
  return (
    <tr className="text-xl p-2 odd:bg-slate-50">
      <td className="p-2"><input type="checkbox" onClick={click}/></td>
      {keys.map((key, column) => {
        const value = (entry as Record<string, unknown>)[key];
        return (
          <td key={key} className={c("p-1 border-r-2", {"max-w-[5em] whitespace-nowrap text-ellipsis overflow-hidden": column === 0})}>
            {value === undefined ? "" : 
            typeof value !== "object" ? String(value) :
            value instanceof Blob ? <a href={URL.createObjectURL(value)} className="text-blue-800 underline">blob</a> : 
            JSON.stringify(value)}
          </td>
        );
      })}
    </tr>
  );
}