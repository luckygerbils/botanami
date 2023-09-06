import React, { useCallback, useEffect, useState } from "react";
import { BackButton } from "../common/back-button";
import { Layout } from "../common/layout";
import { getGoogleOAuthUrl, getOAuthAccessToken, listFiles, putFile } from "../google-api";
import { Button } from "../common/button";
import { Backup } from "../types";
import { BackupList } from "./backup-list";
import { H1 } from "../common/h1";
import { Spinner } from "../common/spinner";
import { createBackupFile } from "../api/backup";

export const regexp = /^\/backup$/;
export async function getInitialProps(): Promise<BackupPageProps> {
  return {
    isAccountLinked: getOAuthAccessToken() != null,
  };
}

export function backupPage(): string {
  return "/backup";
}

async function loadBackups(): Promise<Backup[]> {
  const result = await listFiles();
  return result.files.map(({ name, id }) => ({ date: new Date(name.replace(/.tar$/, "")), id }));
}

interface BackupPageProps {
  isAccountLinked: boolean,
}

export default function BackupPage({
  isAccountLinked
}: BackupPageProps) {
  const linkAccount = useCallback(() => {
    location.assign(getGoogleOAuthUrl());
  }, []);

  const [ backups, setBackups ] = useState<{ loading?: boolean, list?: Backup[], error?: Error }>({});
  useEffect(() => {
    void (async function() {
      setBackups({ loading: true });
      try {
        setBackups({ list: await loadBackups() });
      } catch (e) {
        setBackups({ error: e instanceof Error ? e : new Error(String(e)) });
      }
    })();
  }, []);

  const removeDeletedBackup = useCallback((deletedBackup: Backup) => {
    setBackups(backups => ({ ...backups, list: backups.list?.filter(({ id}) => id !== deletedBackup.id )}));
  }, []);

  const [ { backingUp, backupComplete, error }, setState ] = useState<{backingUp?: boolean, backupComplete?: boolean, error?: Error}>({})
  const backup = useCallback(async () => {
    setState({ backingUp: true });
    try {
      const backupName = new Date().toISOString();
      const tarFile = await createBackupFile(backupName);
      const file = await putFile(`${backupName}.tar`, tarFile);
      setBackups(backups => ({ ...backups, list: [ ...(backups.list ?? []), { date: new Date(), id: file.id }] }));
      setState({ backupComplete: true });
    } catch (e) {
      setState({ error: e instanceof Error ? e : new Error(String(e)) });
    }
  }, []);

  return (
    <Layout button={<BackButton href="/list" />} header={<H1>Manage Backups</H1>}>
        {!isAccountLinked &&
          <>  
            <section className="p-3 h-full flex flex-col items-center justify-center">
              <div className="text-2xl p-3">
                No Backup Account Linked
              </div>
              <Button className="text-2xl mb-20" onClick={linkAccount}>
                Link Backup Account
              </Button>
            </section>
          </>
        }
        {isAccountLinked && <>
          <section className="p-3">
            <Button className="text-2xl" onClick={backup} disabled={backingUp}>Back Up</Button>
            {backingUp && (
              <div className="flex justify-center mt-2">
                <div className="text-2xl p-3 m-auto">
                  <Spinner /> Backing Up...
                </div>
              </div>
            )}
            {backupComplete && (
              <div className="flex justify-center mt-2">
                <div className="text-2xl p-3 m-auto bg-green-100">
                  Backup Complete!
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center mt-2">
                <div className="text-2xl p-3 m-auto bg-red-100">
                  Error: {error.message}
                </div>
              </div>
            )}
          </section>
          <BackupList backups={backups} onDelete={removeDeletedBackup} />
        </>}
    </Layout>
  )
}