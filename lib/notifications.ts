export async function requestNotificationPermission(): Promise<NotificationPermission | undefined> {
  if (typeof Notification === "undefined") return undefined;
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export function notify(title: string, body: string): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body });
}
