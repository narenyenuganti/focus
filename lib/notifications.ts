let swRegistration: ServiceWorkerRegistration | null = null;

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  if (!("serviceWorker" in navigator)) return null;
  swRegistration = await navigator.serviceWorker.register("/sw.js");
  return swRegistration;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | undefined> {
  if (typeof Notification === "undefined") return undefined;
  if (Notification.permission !== "default") return Notification.permission;
  const permission = await Notification.requestPermission();
  if (permission === "granted") await getRegistration();
  return permission;
}

export async function notify(title: string, body: string): Promise<void> {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  const reg = await getRegistration();
  if (!reg) return;
  await reg.showNotification(title, { body });
}
