import React, { useContext } from "react";
import { HamburgerIcon } from "../common/icons";
import { MenuControlsContext } from "../common/menu";

export function MenuButton() {
    const menuControls = useContext(MenuControlsContext);
    return (
        <button className="p-5 no-tap-highlight" onClick={menuControls.open}>
            <HamburgerIcon />
        </button>
    )
}