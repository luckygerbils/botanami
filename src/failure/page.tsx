import React from "react";
import { BackButton } from "../common/back-button";
import { Layout } from "../common/layout";
import { H1 } from "../common/h1";

interface FailurePageProps {
    error: Error,
}

export default function FailurePage({
    error
}: FailurePageProps) {
  console.log("Error", error);

  return (
    <Layout
      button={<BackButton />}
      header={<H1>Error</H1>}
    >
      <header className="p-2 bg-red-700">
        <b>Error:</b>{' '}
        {error.message == null || error.message.trim().length === 0 || <i>(No message)</i>}
      </header>
      <div className="bg-zinc-800 whitespace-pre-wrap p-2 pl-12 -indent-10 break-all">
        {error.stack?.split("\n").map((entry, i) => <div key={i}>{entry}</div>)}
      </div>
    </Layout>
  );
}