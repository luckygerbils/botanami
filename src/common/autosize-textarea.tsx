import React, { ChangeEvent, useCallback, useState } from "react";

interface AutosizeTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}

export function AutosizeTextArea({
    className,
    rows: _,
    ...otherProps
}: AutosizeTextAreaProps) {
    const rows = Math.max(2, otherProps.value == null ? 2 : String(otherProps.value).split("\n").length);
    return (
        <textarea
            className={`
                w-full p-2
                bg-zinc-800 
                outline-none 
                border-2 border-transparent focus:border-zinc-700 ${className}`} 
            {...otherProps} 
            rows={rows} />
    );
}