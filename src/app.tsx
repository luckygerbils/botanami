/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType, useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import FailurePage from "./failure/page";
import { RequestProps } from "./types";

import * as NotFoundPage from "./not-found/page";
import * as ListPage from "./planting-list/page";
import * as AboutPage from "./about/page";
import * as PlantPage from "./plant/page";
import * as NewPlantPage from "./plant/new/page";
import * as PlantEditFactPage from "./plant/fact/page";
import * as PlantingPage from "./planting/page";
import * as PlantingTimelineEntryPage from "./planting/timeline/page";
import * as EditPlantingPage from "./planting/edit/page";
import * as EditPlantingChangePlantPage from "./planting/edit/plant/page";
import * as NewPlantingPage from "./planting/new/page";
import * as BackupPage from "./backup/page";
import * as DebugPage from "./debug/page";
import * as DebugStorePage from "./debug/store/page";

const PAGES: PageExports<any>[] = [
    ListPage,
    DebugPage,
    DebugStorePage,
    AboutPage,
    ListPage,
    PlantPage,
    NewPlantPage, 
    PlantEditFactPage, 
    PlantingPage, 
    PlantingTimelineEntryPage, 
    EditPlantingPage, 
    EditPlantingChangePlantPage, 
    NewPlantingPage, 
    BackupPage, 
];

interface PageExports<T> {
    default: ComponentType<T>,
    regexp?: RegExp,
    getInitialProps?: (r: RequestProps<any, any>) => T,
}

interface PageMatch {
    exports: PageExports<any>,
    groups?: Record<string, string>,
}

function matchPage(url: string): PageMatch {
    for (const exports of PAGES) {
        if (exports.regexp != null) {
            const match = url.match(exports.regexp);
            if (match) {
                return { 
                    groups: match.groups && Object.fromEntries(Object.entries(match.groups)
                        .map(([groupName, value]) => [groupName, decodeURIComponent(value)])), 
                    exports,
                };
            }
        }
    }
    return { exports: NotFoundPage };
}

interface AppProps {
    initialUrl: string,
}

export function App({
    initialUrl
}: AppProps) {
    const [page, setPage] = useState<{loading?: boolean, Component?: any, initialProps?: any, error?: Error}>({ loading: true });

    const loadPage = useCallback(async (fullUrl: string) => {
        console.log("Loading page", fullUrl);
        setPage({ loading: true });
        try {
            const [ url, queryString ] = fullUrl.split("?");
            const query = new URLSearchParams(queryString);
            const pageMatch = matchPage(url);
            const { default: Component, getInitialProps } = pageMatch.exports;
            if (Component == null) {
                throw new Error("Page module should have default export");
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const initialProps = getInitialProps ? await getInitialProps({ url, query, groups: pageMatch.groups }) : {};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            setPage({ Component, initialProps });
        } catch (e) {
            setPage({ Component: FailurePage, initialProps: { error: e as Error } });
        }
    }, []);

    useEffect(() => {
        void loadPage(initialUrl);
        const cb = async (e: HashChangeEvent) => {
            void loadPage(new URL(e.newURL).hash.replace(/^#/, ""));
        };
        window.addEventListener("hashchange", cb);
        return () => window.removeEventListener("hashchange", cb);
    }, [initialUrl, loadPage]);

    if (page.loading) {
        return null;
    }

    if (page.error) {
        return (
            <div className="bg-red-100">
                {page.error.message}
            </div>
        )
    }

    return (
        <page.Component {...page.initialProps} />
    );
}