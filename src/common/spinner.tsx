import React from "react";

interface SpinnerProps {
    size?: "sm"|"md"|"lg"
}

export function Spinner({
    size="md"
}: SpinnerProps) {
    const sizeRem = {
        sm: "1rem",
        md: "2rem",
        lg: "3rem"
    }[size];

    const borderWidth = {
        sm: ".2em",
        md: ".25em",
        lg: ".3em",
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