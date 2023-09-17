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
      <div className="h-screen text-light">
        <Menu ref={menu} />
        <div className="bg-black flex flex-col h-screen">
          <header className="flex items-center">
            {button}
            {header}
          </header>
          <div className="bg-dark overflow-scroll grow flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </MenuControlsContext.Provider>
  );
}