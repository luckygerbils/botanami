import React, { CSSProperties, PropsWithChildren } from "react";
import c from "classnames";
import { Link } from "./link";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

export function Input({
    className,
    ...otherProps
}: PropsWithChildren<InputProps>) {
    return (
        <input 
            className={`
                p-2 w-full
                bg-zinc-800 
                outline-none 
                border-2 border-transparent focus:border-zinc-700 ${className}`} 
            {...otherProps} 
        />
    )
}