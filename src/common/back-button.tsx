import React, { useCallback } from "react";
import { LeftArrowIcon } from "./icons";
import { back, goTo } from "./link";

interface BackButtonProps {
    onClick?: () => void,
    href?: string,
}

export function BackButton({
    href,
    onClick,
}: BackButtonProps) {
    const click = useCallback(() => {
        if (href) {
            goTo(href);
        } else {
            back();
        }
    }, [href])
    return (
        <button className="p-5 text-xl" onClick={onClick ?? click}>
            <LeftArrowIcon />
        </button>
    );
}