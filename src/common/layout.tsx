import React, { ReactNode, useEffect } from "react";
import c from "classnames";

interface LayoutProps {
    title?: string,
    button: ReactNode,
    header: ReactNode,
}

export function Layout({
    title,
    button,
    header,
    children 
}: React.PropsWithChildren<LayoutProps>) {
    useEffect(() => {
        document.title = title ?? "Botanami";
    }, [title]);


    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return (
        <div className="h-screen flex flex-col">
            <header className="border-b-2 flex items-center">
                {button}
                {header}
            </header>
            <div className="overflow-scroll grow flex flex-col">
                {children}
            </div>
        </div>
    )
}