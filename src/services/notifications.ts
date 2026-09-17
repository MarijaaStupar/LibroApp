import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

const STORAGE_KEY = "reading_reminder_enabled";
const NOTIFICATION_ID = "daily-reading-reminder";

function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

let handlerReady = false;

async function loadNotifications() {
  const Notifications = await import("expo-notifications");
  if (!handlerReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerReady = true;
  }
  return Notifications;
}

export async function isReadingReminderEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value === "true";
}

export type ReminderResult =
  | { ok: true }
  | { ok: false; reason: "expo-go" | "permission-denied" | "error"; message?: string };

export async function setReadingReminder(
  enabled: boolean,
): Promise<ReminderResult> {
  if (isExpoGo()) {
    return { ok: false, reason: "expo-go" };
  }
  try {
    const Notifications = await loadNotifications();

    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        return { ok: false, reason: "permission-denied" };
      }

      if (Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Podsetnici za čitanje",
          importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
        }).catch(() => {});
      }

      await Notifications.cancelScheduledNotificationAsync(
        NOTIFICATION_ID,
      ).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: "Vreme je za čitanje 📖",
          body: "Otvori Libro i nastavi svoju knjigu.",
          ...(Notifications.AndroidNotificationPriority
            ? { channelId: "reminders" }
            : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });

      await AsyncStorage.setItem(STORAGE_KEY, "true");
      return { ok: true };
    }

    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(
      () => {},
    );
    await AsyncStorage.setItem(STORAGE_KEY, "false");
    return { ok: true };
  } catch (e: any) {
    console.log("setReadingReminder error", e);
    return { ok: false, reason: "error", message: e?.message ?? String(e) };
  }
}
