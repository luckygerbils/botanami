import React from "react";
import { BackButton } from "../common/back-button";
import { Layout } from "../common/layout";
import { H1 } from "../common/h1";

export async function getInitialProps({ url }: { url: string }): Promise<NotFoundPageProps> {
  return {
    url
  };
}

interface NotFoundPageProps {
    url: string,
}

export default function NotFoundPage({
    url
}: NotFoundPageProps) {
  return (
    <Layout 
      button={<BackButton />}
      header={<H1>Not Found</H1>}
    > 
      <h1 className="text-3xl p-3">404 Not Found</h1>
      <div className="bg-red-100">
        {url}
      </div>
    </Layout>
  )
}