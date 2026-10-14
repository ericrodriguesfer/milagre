import { useSyncExternalStore } from "react";

type Overlay = EventTarget & {
  visible: boolean;
  getTitlebarAreaRect: () => DOMRect;
};
type ChromeLayout = { sidebarLeft: number; rightInset: number; controlsEnd: number };

function overlay(): Overlay | undefined {
  return (navigator as Navigator & { windowControlsOverlay?: Overlay }).windowControlsOverlay;
}

/** Geometry belongs to the local window, not to the computer whose Project it displays. */
function readWindowChrome(): ChromeLayout {
  const mode = window.milagreWindowChrome?.controls ?? "external";
  let sidebarLeft = mode === "leading" ? 88 : 12;
  let rightInset = mode === "overlay" ? 150 : 0;
  const controls = overlay();
  if (mode !== "external" && controls) {
    if (!controls.visible) {
      sidebarLeft = 12;
      rightInset = 0;
    } else {
      const rect = controls.getTitlebarAreaRect();
      if (rect.width > 0) {
        sidebarLeft = rect.x > 0 ? rect.x + 8 : 12;
        const trailing = Math.max(0, window.innerWidth - rect.right);
        rightInset = trailing > 0 ? trailing + 8 : 0;
      }
    }
  }
  return { sidebarLeft, rightInset, controlsEnd: sidebarLeft + 32 + 8 };
}

function subscribe(notify: () => void) {
  const controls = overlay();
  controls?.addEventListener("geometrychange", notify);
  window.addEventListener("resize", notify);
  return () => {
    controls?.removeEventListener("geometrychange", notify);
    window.removeEventListener("resize", notify);
  };
}

// A primitive snapshot stays stable between geometry events, as useSyncExternalStore requires.
function snapshot() {
  const { sidebarLeft, rightInset } = readWindowChrome();
  return `${sidebarLeft}:${rightInset}`;
}

export function useWindowChrome(): ChromeLayout {
  useSyncExternalStore(subscribe, snapshot);
  return readWindowChrome();
}
