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
      <h1 className="text-3xl p-3">500 Internal Server Error</h1>
      <div className="bg-red-100">
        Error: {error.message}
        {error.stack?.split("\n").map((entry, i) => <div key={i}>{entry}</div>)}
      </div>
    </Layout>
  );
}