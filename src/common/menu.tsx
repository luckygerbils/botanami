import React, { PropsWithChildren, useCallback, useRef, PointerEvent, useState, createContext, forwardRef, useImperativeHandle } from "react";
import { aboutPage } from "../about/page";
import { backupPage } from "../backup/page";
import { debugPage } from "../debug/page";
import { plantingListPage } from "../planting-list/page";
import { Link } from "./link";
import c from "classnames";

export interface MenuControls {
  open: () => void
}
export const MenuControlsContext = createContext<MenuControls>({ open(){} });

export const Menu = forwardRef(function Menu(_, ref) {
  const menuElement = useRef<HTMLDivElement>(null);
  const [ { isOpen, dragAmount, dragPercent }, setState ] = useState<{dragAmount?: number, dragPercent?: number, isOpen: boolean}>({ isOpen: false });
  const close = useCallback(() => setState({ isOpen: false }), []);
  const open = useCallback(() => setState({ isOpen: true }), []);
  useImperativeHandle(ref, () => ({ open }));

  const pointers = useRef<Map<number, {x: number, y: number}>>(new Map());
  const pointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    setState(({isOpen}) => ({ isOpen, dragAmount: 0, dragPercent: 0 }));
    pointers.current.set(e.pointerId, { x: e.pageX, y: e.pageY });
    menuElement.current?.setPointerCapture(e.pointerId);
  }, []);
  const pointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const start = pointers.current.get(e.pointerId);
    if (start != null) {
        const dX = e.pageX - start.x;
        const dragPercent = Math.abs(dX / menuElement.current!.offsetWidth);
        setState(({isOpen}) => ({ isOpen, dragAmount: dX, dragPercent}));
    }
  }, []);
  const pointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.delete(e.pointerId)) {
      menuElement.current?.releasePointerCapture(e.pointerId);
      setState(({ dragPercent, isOpen }) => ({ isOpen: dragPercent! > 0.5 ? !isOpen: isOpen }));
    }
  }, []);

  return (
    <>
      <div 
        className={c(
          "absolute inset-0 bg-black h-screen w-screen transition-opacity",
          { "pointer-events-none": !isOpen },
        )}
        style={{
          opacity: dragPercent == null 
            ? isOpen ? 0.5 : 0 
            : isOpen ? (1 - dragPercent) * 0.5 : dragPercent * 0.5,
        }}
        onClick={close} 
      />
      <aside 
        ref={menuElement}
        className="absolute inset-0 h-screen w-2/3 bg-white shadow-lg transition-all overflow-hidden touch-none"
        style={{
          opacity: dragPercent != null ? 1: (isOpen ? 1 : 0),
          transform: dragAmount == null 
            ? isOpen ? "none" : "translate(calc(-100% + 20px))"
            : isOpen ? `translate(${dragAmount}px)` 
                      : `translate(min(calc(-100% + 10px + ${dragAmount}px), 0px))`
        }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onPointerOut={pointerUp}
        onPointerLeave={pointerUp}
      >
        <div className={c("flex flex-col", { "pointer-events-none": !isOpen })}>
          <header className="p-3 text-2xl">
              Botanami
          </header>
          <MenuItem linkTo={plantingListPage()}>Plantings</MenuItem>
          <MenuItem linkTo={aboutPage()}>About</MenuItem>
          <hr />
          <MenuItem linkTo={backupPage()}>Manage Backups</MenuItem>
          <hr />
          <MenuItem linkTo={debugPage()}>Debug</MenuItem>
          </div>
      </aside>
    </>
  )
})

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