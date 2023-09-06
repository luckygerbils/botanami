import React from "react";

interface ScientificNameProps {
    name: string,
}

export function ScientificName({ name }: ScientificNameProps) {
    return (
        <span className="italic">{name}</span>
    );
}