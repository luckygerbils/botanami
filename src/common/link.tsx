import React, { PropsWithChildren } from "react";

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    to: string,
}

export function Link({
    children,
    to,
    className,
    ...props
}: PropsWithChildren<LinkProps>) {
    return (
        <a {...props} href={`/#${to}`} className={`pointer-cursor ${className}`}>
            {children}
        </a>
    );
}

export function goTo(to: string) {
    location.assign(`/#${to}`);
}

export function back(delta=1) {
    history.go(-delta);
}