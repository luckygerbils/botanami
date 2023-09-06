import React from "react";
import { Layout } from "../common/layout";
import { H1 } from "../common/h1";
import { Menu } from "../planting-list/menu";
import { RequestProps } from "../types";
import { getDb } from "../db";
import { toPromise } from "../db/util";
import { Link } from "../common/link";
import { debugStorePage } from "./store/page";

export function debugPage(): string {
  return "/debug";
}
export const regexp = /^\/debug$/;
export async function getInitialProps(requestProps: RequestProps<void>): Promise<DebugPageProps> {
  const db = await getDb();
  const objectStoreNames = Array.from(db.objectStoreNames);
  const transaction = db.transaction(objectStoreNames, "readonly");
  return {
    dbVersion: db.version,
    objectStoreCounts: Object.fromEntries(await Promise.all(
      objectStoreNames.map(
        async objectStoreName => [
          objectStoreName, 
          await toPromise<number>(transaction.objectStore(objectStoreName).count())
        ] as const)
    )),
  };
}

interface DebugPageProps {
  dbVersion: number
  objectStoreCounts: Record<string, number>,
}
export default function DebugPage({ 
  dbVersion,
  objectStoreCounts, 
}: DebugPageProps) {
  return (
    <Layout
      button={<Menu />} 
      header={<H1>Botanami - Debug</H1>}
    >
      <div className="text-2xl p-3">DB Version: {dbVersion}</div>
      <div className="border-t-4">
        {Object.entries(objectStoreCounts).map(([storeName, count]) =>
          <Link className="text-2xl p-3 border-b-2 grid grid-cols-2 odd:bg-slate-50" key={storeName} to={debugStorePage({ storeName })}>
            <div>{storeName}</div>
            <div className="text-right">{count}</div>
          </Link>)}
      </div>
    </Layout>
  )
}
