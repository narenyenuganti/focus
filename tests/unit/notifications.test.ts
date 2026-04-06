import { describe, it, expect, vi, beforeEach } from "vitest";
import { notify, requestNotificationPermission } from "@/lib/notifications";

describe("requestNotificationPermission", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls Notification.requestPermission when permission is default", () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("Notification", { permission: "default", requestPermission });

    requestNotificationPermission();

    expect(requestPermission).toHaveBeenCalledOnce();
  });

  it("does not call requestPermission when already granted", () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("Notification", { permission: "granted", requestPermission });

    requestNotificationPermission();

    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("does not call requestPermission when denied", () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("Notification", { permission: "denied", requestPermission });

    requestNotificationPermission();

    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("no-ops when Notification API is unavailable", () => {
    vi.stubGlobal("Notification", undefined);

    expect(() => requestNotificationPermission()).not.toThrow();
  });
});

describe("notify", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a Notification when permission is granted", () => {
    const MockNotification = vi.fn();
    MockNotification.permission = "granted";
    vi.stubGlobal("Notification", MockNotification);

    notify("Test Title", "Test body");

    expect(MockNotification).toHaveBeenCalledWith("Test Title", { body: "Test body" });
  });

  it("does not create a Notification when permission is denied", () => {
    const MockNotification = vi.fn();
    MockNotification.permission = "denied";
    vi.stubGlobal("Notification", MockNotification);

    notify("Test Title", "Test body");

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it("does not create a Notification when permission is default", () => {
    const MockNotification = vi.fn();
    MockNotification.permission = "default";
    vi.stubGlobal("Notification", MockNotification);

    notify("Test Title", "Test body");

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it("no-ops when Notification API is unavailable", () => {
    vi.stubGlobal("Notification", undefined);

    expect(() => notify("Test Title", "Test body")).not.toThrow();
  });
});
