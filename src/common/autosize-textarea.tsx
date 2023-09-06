import React, { ChangeEvent, useCallback, useState } from "react";

interface AutosizeTextAreaProps extends React.ButtonHTMLAttributes<HTMLTextAreaElement> {
}

export function AutosizeTextArea(props: AutosizeTextAreaProps) {
    const rows = props.value == null ? 0 : String(props.value).split("\n").length;
    return (
        <textarea {...props} rows={rows} />
    );
}