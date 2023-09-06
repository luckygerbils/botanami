import React, { CSSProperties, PropsWithChildren } from "react";
import c from "classnames";
import { Link } from "./link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    linkTo?: string,
    variant?: Variant,
    floating?: boolean,
}

type Variant = "primary"|"secondary"|"save"|"danger"|"link";

export function Button({
    children,
    linkTo,
    onClick,
    className,
    variant="primary",
    disabled,
    floating,
    ...otherProps
}: PropsWithChildren<ButtonProps>) {
    const bgClass = {
        "primary": {
            disabled: "bg-lime-100",
            normal: "bg-lime-400",
        },
        "secondary": {
            disabled: "bg-stone-100",
            normal: "bg-stone-300"
        },
        "danger": {
            disabled: "bg-red-100",
            normal: "bg-red-400",
        },
        "link": {},
        "save": {
            disabled: "bg-blue-200",
            normal: "bg-blue-600"
        }
    }[variant][disabled ? "disabled" : "normal"];

    const textClass = {
        "primary": {
            disabled: "text-slate-400",
            normal: "text-slate-950",
        },
        "secondary": {
            disabled: "text-slate-400",
            normal: "text-slate-950",
        },
        "danger": {
            disabled: "text-slate-400",
            normal: "text-slate-950",
        },
        "link": {
            disabled: "text-slate-400",
            normal: "text-blue-400",
        },
        "save": {
            disabled: "text-slate-100",
            normal: "text-slate-100",
        }
    }[variant][disabled ? "disabled" : "normal"];

    let basicClasses;
    if (floating) {
        basicClasses = `fixed bottom-10 right-10
            w-16 h-16 rounded-full 
            flex justify-center items-center 
            text-3xl font-bold
            active:bg-blue-400
            active:ring-2`;
    } else if (variant === "link") {
        basicClasses = `flex justify-center items-center`;
    } else {
        basicClasses = `p-2 rounded ${!className?.includes("w-") ? "w-full" : ""} flex justify-center items-center`;
    }

    if (linkTo != null) {
        return (
            <Link
                to={linkTo}
                className={c(
                    basicClasses,
                    bgClass, 
                    textClass,
                    className,
                )}
            >
                {children}
            </Link>
        )
    } else {
        return (
            <button
                className={c(
                    basicClasses,
                    bgClass, 
                    textClass,
                    className,
                )}
                onClick={onClick}
                disabled={disabled}
                {...otherProps}
            >
                {children}
            </button>
        );
    }
}