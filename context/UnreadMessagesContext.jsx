import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "@/config/axios";

export const UnreadMessagesContext = createContext({
  unreadCount: 0,
  fetchUnreadMessages: () => Promise.resolve(),
  decrementUnreadCount: () => {},
  refreshUnreadMessages: () => Promise.resolve(),
});
export function UnreadMessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const response = await axiosInstance.get("contact-forms");
      const fetchedMessages = response.data;
      const unread = fetchedMessages.filter(
        (message) => !message.is_seen
      ).length;
      setUnreadCount(unread);
      return unread;
    } catch (err) {
      console.error("Error fetching messages:", err);
      setUnreadCount(0);
      return 0;
    }
  }, []);

  const refreshUnreadMessages = useCallback(async () => {
    return await fetchUnreadMessages();
  }, [fetchUnreadMessages]);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    fetchUnreadMessages();
  }, [fetchUnreadMessages]);

  const value = {
    unreadCount,
    fetchUnreadMessages,
    decrementUnreadCount,
    refreshUnreadMessages,
  };

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadMessages must be used within an UnreadMessagesProvider"
    );
  }
  return context;
}

export default UnreadMessagesProvider;
