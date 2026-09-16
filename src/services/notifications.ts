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

export async function setReadingReminder(enabled: boolean): Promise<boolean> {
  if (isExpoGo()) {
    return false;
  }
  try {
    const Notifications = await loadNotifications();

    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        return false;
      }

      await Notifications.cancelScheduledNotificationAsync(
        NOTIFICATION_ID,
      ).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: "Vreme je za čitanje 📖",
          body: "Otvori Libro i nastavi svoju knjigu.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(STORAGE_KEY, "true");
      return true;
    }

    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(
      () => {},
    );
    await AsyncStorage.setItem(STORAGE_KEY, "false");
    return true;
  } catch {
    return false;
  }
}
