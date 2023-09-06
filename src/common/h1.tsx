import React, { PropsWithChildren } from "react";
import c from "classnames";

interface H1Props extends React.ButtonHTMLAttributes<HTMLHeadingElement> {
   
}

export function H1({
    children,
    className,
    ...props
}: PropsWithChildren<H1Props>) {
    return (
        <h1 className={c("text-2xl", className)}>
            {children}
        </h1>
    ) 
}