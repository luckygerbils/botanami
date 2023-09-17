import { useMemo, useEffect } from "react";

export function useObjectURL(blob: Blob) {
    const url = useMemo(() => URL.createObjectURL(blob), [blob]);
    useEffect(() => {
        () => URL.revokeObjectURL(url);
    }, [url]);
    return url;
}