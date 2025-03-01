"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/config/axios";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/contact-forms");
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (messageId) => {
    router.push(`/messages/${messageId}`);
  };

  console.log(messages);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

      <div className="grid gap-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50
                ${
                  !message.is_seen
                    ? "border-l-4 border-l-red-500 bg-red-50"
                    : ""
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {message.contact_details.name ||
                    message.contact_details.full_name ||
                    "Anonymous"}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-gray-600 truncate">
                {message.contact_details.message ||
                  message.contact_details.email ||
                  "No message content"}
              </div>
              {!message.is_seen && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                    New
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No messages received yet.
          </div>
        )}
      </div>
    </div>
  );
}
