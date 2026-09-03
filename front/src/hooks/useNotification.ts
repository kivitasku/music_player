import { useEffect, useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeout = setTimeout(() => {
      setNotification(null);
    }, 2900);

    return () => clearTimeout(timeout);
  }, [notification]);

  const showNotification = (message: string) => {
    setNotification(message);
  };

  return {
    notification,
    showNotification,
  };
}