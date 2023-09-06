import React, { PropsWithChildren, useCallback, useState } from "react";
import c from "classnames";
import { HamburgerIcon } from "../common/icons";
import { Link } from "../common/link";
import { aboutPage } from "../about/page";
import { backupPage } from "../backup/page";
import { debugPage } from "../debug/page";
import { plantingListPage } from "./page";

export function Menu() {
    const [open, setOpen] = useState(false);
    const openMenu = useCallback(() => setOpen(true), []);
    const closeMenu = useCallback(() => setOpen(false), []);

    return (
        <>
            <button className="p-5" onClick={openMenu}>
                <HamburgerIcon />
            </button>
            <div className={c("absolute inset-0 bg-black opacity-50 h-screen w-screen", { hidden: !open})} onClick={closeMenu} />
            <aside className={c("absolute inset-0 h-screen bg-white shadow-sm flex flex-col transition-all overflow-hidden", open ? "w-2/3" : "w-0")}>
                <header className="p-3 text-2xl">
                    Botanami
                </header>
                <MenuItem linkTo={plantingListPage()}>Plantings</MenuItem>
                <MenuItem linkTo={aboutPage()}>About</MenuItem>
                <hr />
                <MenuItem linkTo={backupPage()}>Manage Backups</MenuItem>
                <hr />
                <MenuItem linkTo={debugPage()}>Debug</MenuItem>
            </aside>
        </>
    )
}

interface MenuItemProps {
    linkTo: string,
}

function MenuItem({ 
    children,
    linkTo,
}: PropsWithChildren<MenuItemProps>) {
    return (
        <Link className="text-xl px-4 py-2" to={linkTo}>
            {children}
        </Link>
    );
}