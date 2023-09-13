import React, { ReactNode, useCallback, useEffect, TouchEvent, useState, PointerEvent, useRef } from "react";
import c from "classnames";
import { Menu, MenuControls, MenuControlsContext } from "./menu";

interface LayoutProps {
  title?: string,
  button: ReactNode,
  header: ReactNode,
}

export function Layout({
  title,
  button,
  header,
  children 
}: React.PropsWithChildren<LayoutProps>) {
  useEffect(() => {
    document.title = title ?? "Botanami";
  }, [title]);

  const menu = useRef<MenuControls>(null);
  const openMenu = useCallback(() => {
    menu.current?.open();
  }, []);
  
  return (
    <MenuControlsContext.Provider value={{ open: openMenu }}>
      <div className="h-screen">
        <Menu ref={menu} />
        <div className="flex flex-col h-screen">
          <header className="border-b-2 flex items-center">
            {button}
            {header}
          </header>
          <div className="overflow-scroll grow flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </MenuControlsContext.Provider>
  );
}