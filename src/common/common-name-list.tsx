import React, { PropsWithChildren, ReactNode } from "react";

interface CommonNameListProps {
    list: ReactNode[]
}

export function CommonNameList({ list }: CommonNameListProps) {
    return (
        <>{list[0]}{list.slice(1).map((entry, i) => <React.Fragment key={i}>,{' '}<span className="inline-block">{entry}</span></React.Fragment>)}</>
    );
}