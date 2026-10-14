// @ts-check

/**
 * Native decorations live outside the web content. An overlay owns its controls even on a Linux desktop
 * that does not draw server-side decorations; Chromium reports the remaining title-bar area to the renderer.
 * @param {NodeJS.Platform} platform
 * @param {boolean} overlay
 * @returns {{ controls: "leading" | "overlay" | "external", options: Electron.BrowserWindowConstructorOptions }}
 */
function windowChrome(platform, overlay = false) {
  if (platform === "darwin") {
    return {
      controls: "leading",
      options: { titleBarStyle: "hidden", titleBarOverlay: { height: 60 }, trafficLightPosition: { x: 24, y: 24 } },
    };
  }
  if (overlay) {
    return {
      controls: "overlay",
      options: { titleBarStyle: "hidden", titleBarOverlay: { height: 60 } },
    };
  }
  return { controls: "external", options: {} };
}

module.exports = { windowChrome };
