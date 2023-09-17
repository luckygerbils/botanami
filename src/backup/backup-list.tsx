import React, { useCallback, useEffect, useState } from "react";
import { listFiles } from "../google-api";
import { BackupListEntry } from "./backup-list-entry";
import { Backup } from "../types";
import { dateCompare, reversed } from "../util/sorting";

interface BackupListProps {
  backups: {
    loading?: boolean,
    list?: Backup[],
    error?: Error,
  },
  onDelete: (backup: Backup) => void
}

export function BackupList({
  backups,
  onDelete,
}: BackupListProps) {
  return (
    <section>
      <header className="text-2xl py-2 px-4 bg-black mb-2 font-bold">
        Current Backups
      </header>
      <div className="p-3">
      {backups.loading && (
          <div className="flex justify-center">
          <div className="text-2xl p-10 m-auto">
              Loading...
          </div>
          </div>
      )}
      {backups.error && (
        <div className="flex justify-center">
          <div className="text-2xl p-10 m-auto bg-red-100">
              Error fetching backups: {backups.error.message}
          </div>
        </div>
      )}
      {backups.list && (
          <>
          {backups.list.length === 0 && (
            <div className="flex justify-center">
              <div className="text-2xl p-10 m-auto">
                  No backups found
              </div>
            </div>
          )}
          {backups.list.length > 0 && (
            <>
              <ul>
                {backups.list
                  .sort(reversed((a, b) => dateCompare(a.date, b.date)))
                  .map(backup => (
                    <BackupListEntry key={backup.id} backup={backup} onDelete={onDelete} />
                  ))}
              </ul>
            </>
          )}
          </>
      )}
      </div>
  </section>
  )
}