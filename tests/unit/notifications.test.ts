import { describe, it, expect, vi, beforeEach } from "vitest";

function stubServiceWorker(showNotification = vi.fn().mockResolvedValue(undefined)) {
  const registration = { showNotification };
  vi.stubGlobal("navigator", {
    ...navigator,
    serviceWorker: { register: vi.fn().mockResolvedValue(registration) },
  });
  return { registration };
}

async function loadModule() {
  vi.resetModules();
  return import("@/lib/notifications");
}

describe("requestNotificationPermission", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls Notification.requestPermission when permission is default", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("Notification", { permission: "default", requestPermission });
    stubServiceWorker();

    const { requestNotificationPermission } = await loadModule();
    await requestNotificationPermission();

    expect(requestPermission).toHaveBeenCalledOnce();
  });

  it("does not call requestPermission when already granted", async () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("Notification", { permission: "granted", requestPermission });

    const { requestNotificationPermission } = await loadModule();
    await requestNotificationPermission();

    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("does not call requestPermission when denied", async () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("Notification", { permission: "denied", requestPermission });

    const { requestNotificationPermission } = await loadModule();
    await requestNotificationPermission();

    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("no-ops when Notification API is unavailable", async () => {
    vi.stubGlobal("Notification", undefined);

    const { requestNotificationPermission } = await loadModule();
    await expect(requestNotificationPermission()).resolves.not.toThrow();
  });
});

describe("notify", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a notification via service worker when permission is granted", async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("Notification", { permission: "granted" });
    stubServiceWorker(showNotification);

    const { notify } = await loadModule();
    await notify("Test Title", "Test body");

    expect(showNotification).toHaveBeenCalledWith("Test Title", { body: "Test body" });
  });

  it("does not notify when permission is denied", async () => {
    const showNotification = vi.fn();
    vi.stubGlobal("Notification", { permission: "denied" });
    stubServiceWorker(showNotification);

    const { notify } = await loadModule();
    await notify("Test Title", "Test body");

    expect(showNotification).not.toHaveBeenCalled();
  });

  it("does not notify when permission is default", async () => {
    const showNotification = vi.fn();
    vi.stubGlobal("Notification", { permission: "default" });
    stubServiceWorker(showNotification);

    const { notify } = await loadModule();
    await notify("Test Title", "Test body");

    expect(showNotification).not.toHaveBeenCalled();
  });

  it("no-ops when Notification API is unavailable", async () => {
    vi.stubGlobal("Notification", undefined);

    const { notify } = await loadModule();
    await expect(notify("Test Title", "Test body")).resolves.not.toThrow();
  });
});
