export async function requestNotificationPermission(): Promise<NotificationPermission | undefined> {
  if (typeof Notification === "undefined") return undefined;
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

let lastNotification: Notification | null = null;

export function notify(title: string, body: string): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  lastNotification?.close();
  lastNotification = new Notification(title, { body });
}
