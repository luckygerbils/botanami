import React from "react";

interface SpinnerProps {
    size?: "sm"|"md"
}

export function Spinner({
    size="md"
}: SpinnerProps) {
    const sizeRem = {
        sm: "1rem",
        md: "2rem",
    }[size];

    const borderWidth = {
        sm: ".2em",
        md: ".25em",
    }[size];

    return (
        <div style={{
            display: "inline-block",
            width: sizeRem,
            height: sizeRem,
            verticalAlign: "text-bottom",
            border: `${borderWidth} solid currentColor`,
            borderRightColor: "transparent",
            borderRadius: "50%",
            animation: "spinner-border .75s linear infinite",
        }}>
            <span className="sr-only">Loading</span>
        </div>
    )
}