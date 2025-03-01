"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/config/axios";
import Link from "next/link";
import { useUnreadMessages } from "@/context/UnreadMessagesContext";

export default function MessageDetail() {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { decrementUnreadCount, refreshUnreadMessages } = useUnreadMessages();

  useEffect(() => {
    if (id) {
      fetchMessageDetail(id);
    }
  }, [id]);

  const fetchMessageDetail = async (messageId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/contact-forms/${messageId}`);
      setMessage(response.data);

      if (response.data && !response.data.is_seen) {
        await markAsSeen(messageId);
      }
    } catch (error) {
      console.error("Failed to fetch message:", error);
      router.push("/messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (messageId) => {
    try {
      await axiosInstance.patch(`/contact-forms/${messageId}/mark-seen`);
      setMessage((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          is_seen: true,
          seen_at: new Date().toISOString(),
        };
      });

      // Decrement unread count in context and refresh
      decrementUnreadCount();
      await refreshUnreadMessages();
    } catch (error) {
      console.error("Failed to mark message as seen:", error);
    }
  };

  const getSenderName = (contactDetails) => {
    if (!contactDetails || typeof contactDetails !== "object") {
      return "Anonymous";
    }

    const nameFields = [
      "name",
      "full_name",
      "firstname",
      "first_name",
      "fullname",
    ];
    for (const field of nameFields) {
      if (contactDetails[field]) {
        return contactDetails[field];
      }
    }
    return "Anonymous";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container mx-auto p-4">
        <p>Message not found</p>
        <Link href="/messages" className="text-blue-500 hover:underline">
          Back to messages
        </Link>
      </div>
    );
  }

  let contactDetails = {};
  try {
    if (typeof message.contact_details === "string") {
      contactDetails = JSON.parse(message.contact_details);
    }
    else if (
      typeof message.contact_details === "object" &&
      message.contact_details !== null
    ) {
      contactDetails = message.contact_details;
    }
  } catch (error) {
    console.error("Error parsing contact details:", error);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/messages" className="text-blue-500 hover:underline">
          ← Back to messages
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Message from {getSenderName(contactDetails)}
          </h1>
          <div className="text-sm text-gray-500">
            {new Date(message.created_at).toLocaleString()}
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Contact Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {contactDetails && typeof contactDetails === "object" ? (
              Object.entries(contactDetails).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>{" "}
                  <span className="break-words">
                    {typeof value === "string" ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No contact details available</div>
            )}
          </div>
        </div>

        {message.is_seen && message.seen_at && (
          <div className="mt-6 text-sm text-gray-500">
            Seen: {new Date(message.seen_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
