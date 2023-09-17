import { Button } from "../common/button";
import React, { useCallback, MouseEvent, useState, useRef } from "react";
import { Backup } from "../types";
import { deleteFile, getFileData } from "../google-api";
import { DownloadIcon } from "../common/icons";
import { Spinner } from "../common/spinner";
import { restoreBackupFile } from "../api/backup";

interface BackupListEntryProps {
  backup: Backup,
  onDelete: (backup: Backup) => void,
}

export function BackupListEntry({
  backup,
  onDelete,
}: BackupListEntryProps) {
  const [ 
    { 
      deleting=false, 
      downloading=false, 
      restoring=false,
      restoreResults,
      error 
    }, 
    setState 
  ] = useState<{ 
    deleting?: boolean, 
    downloading?: boolean, 
    restoring?: boolean, 
    restoreResults?: Record<string, number>,
    error?: Error 
  }>({});

  const deleteBackup = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
    setState({ deleting: true });
    try {
      await deleteFile(backup.id);
      onDelete(backup);
    } catch (e) {
      setState({ error: e instanceof Error ? e : new Error(String(e))})
    }
  }, [backup, onDelete]);

  const downloadLink = useRef<HTMLAnchorElement>(null);
  const downloadBackup = useCallback(async () => {
    setState({ downloading: true });
    try {
      const blob = await getFileData(backup.id);
      downloadLink.current!.href = URL.createObjectURL(blob);
      downloadLink.current!.download = `${backup.date.toISOString()}.tar`;
      downloadLink.current!.click();
      URL.revokeObjectURL(downloadLink.current!.href);
      setState({ downloading: false });
    } catch (e) {
      setState({ error: e instanceof Error ? e : new Error(String(e))})
    }
  }, [backup.date, backup.id]);

  const restoreBackup = useCallback(async () => {
    setState({ restoring: true });
    try {
      const restoreResults = await restoreBackupFile(await getFileData(backup.id));
      setState({ restoreResults });
    } catch (e) {
      setState({ error: e instanceof Error ? e : new Error(String(e))})
    }
  }, [backup.id]);

  if (error) {
    console.error(BackupListEntry.name, error);
  }

  return (
    <li className="mb-2">
      <div className="text-xl p-2 border-2 border-zinc-500 grid grid-cols-[4fr_1fr_1fr_1fr] gap-1 items-center">
        <div className="grow">{backup.date.toLocaleString(undefined, {dateStyle: "short", timeStyle: "short"})}</div>
        <Button className="w-auto mr-2" variant="danger" onClick={deleteBackup} disabled={deleting || restoring}>delete</Button>
        <Button className="w-auto mr-2" onClick={restoreBackup} disabled={deleting || restoring}>restore</Button>
        <Button className="w-auto p-2" variant="link" onClick={downloadBackup} disabled={deleting || restoring || downloading}>
          {downloading ? <Spinner size="sm" /> : <DownloadIcon />}
        </Button>
        <a className="hidden" ref={downloadLink}></a>
      </div>
      {restoring && (
        <div className="text-xl flex items-center justify-center p-2">
          <Spinner size="sm" />&nbsp;Restoring...
        </div>
      )}
      {error && (
        <div className="text-xl p-2 bg-red-100">
          Error: {error.message}
        </div>
      )}
      {restoreResults && (
        <div className="text-xl flex items-center justify-center p-2 bg-green-100">
          <div>
            Restore Successful!
            <ul className="text-lg">
              {Object.entries(restoreResults).map(([type, count]) => 
                <li key={type}>{type}: {count}</li>)}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}