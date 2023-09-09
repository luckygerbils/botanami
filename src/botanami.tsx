import { App } from "./app";
import { createRoot } from "react-dom/client";
import React from "react";

throw new Error("died");

void (async function() {
    function loadStatus(message: string) {
        const element = document.getElementById("load-status");
        if (element) {
            element.innerText = message;
        }
    }

    try {
        const registration = await navigator.serviceWorker.register(
            new URL("service-worker.ts", import.meta.url), {
                scope: '/',
                type: "module"
            });
        const installingOrWaiting = registration.installing ?? registration.waiting;
        if (installingOrWaiting) {
            await new Promise<void>((resolve, reject) => {
                installingOrWaiting.onstatechange = function() {
                    console.log("state:", installingOrWaiting.state);
                    loadStatus(`state: ${installingOrWaiting.state}`);
                    if (installingOrWaiting.state === 'activated') {
                        console.log('Service worker installed. Resolving');
                        resolve();
                        // window.location.reload(); // Reload so service worker is available.
                    }
                };
            });
        } else {
            console.log("Service worker is active");
        }
    } catch (error) {
        console.error(`Service worker registration failed with ${String(error)}`);
        throw error;
    }

    const container = document.createElement("div");
    const root = createRoot(container)
    root.render(<App initialUrl={location.hash.replace(/^#/, "")} />);
    document.body.childNodes[0].replaceWith(container);
})();