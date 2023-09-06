import React from "react";
import { BackButton } from "../common/back-button";
import { Layout } from "../common/layout";

export function aboutPage(): string {
  return "/about";
}
export const regexp = /^\/about$/;
export async function getInitialProps(): Promise<void> {
  return;
}

export default function AboutPage() {
  return (
    <Layout button={<BackButton />} header="About">
        <section className="text-center p-4">
            <p>Copyright &copy; 2023 Sean Anastasi</p>
            <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.</p>
        </section>
    </Layout>
  )
}