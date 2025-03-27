import React, { useEffect, useState, useMemo } from "react";
import "../../style.css";
import io from "socket.io-client";
import apiClient from "../../../api/apiClient";

const socketCache = new Map();

const getCachedSocket = (topic) => {
  if (!socketCache.has(topic)) {
    const newSocket = io("http://13.203.94.55:4000", {
         path: "/socket.io/",
         transports: ["websocket"],
         secure: true,
         reconnection: true,
         reconnectionAttempts: 5,
         reconnectionDelay: 5000,
         upgrade: false, 
       });

    newSocket.on("connect", () => console.log(`Socket connected for ${topic}`));
    newSocket.on("connect_error", (err) => console.error(`Connection error for ${topic}:`, err));

    socketCache.set(topic, {
      socket: newSocket,
      subscribers: 0,
      messageHandler: null,
    });
  }
  return socketCache.get(topic);
};

const LiveDataTd = ({ topic, onTimestampUpdate }) => {
  const [liveMessage, setLiveMessage] = useState(null);
  const [hasSocketData, setHasSocketData] = useState(false); // Track if socket data has been received
  const isFFT = useMemo(() => topic.split("|")[1] === "fft", [topic]);

  // Fetch the latest message via API only if no socket data has been received
  const fetchLatestMessage = async () => {
    if (hasSocketData) {
      console.log(`Skipping API call for ${topic} as socket data is available`);
      return; // Skip API call if socket data is already received
    }

    try {
      const res = await apiClient.post('/mqtt/topic-based-latest-message', { topic });
      const messageData = res?.data?.data?.message;
      const timestamp = res?.data?.data?.timestamp;
      console.log(`API response for ${topic}:`, res?.data?.data);

      if (messageData) {
        setLiveMessage(messageData);
        if (timestamp && onTimestampUpdate) {
          onTimestampUpdate(topic, timestamp);
        }
      }
    } catch (error) {
      console.log(`Error fetching latest message for ${topic}:`, error.message);
    }
  };

  useEffect(() => {
    if (!isFFT) {
      fetchLatestMessage(); // Initial API call only if no socket data is available
    }
  }, [topic, isFFT]);

  useEffect(() => {
    if (isFFT) return;

    const topicEntry = getCachedSocket(topic);
    const { socket } = topicEntry;

    const handleMessage = (data) => {
      console.log(`Message received for ${topic} via socket:`, data);
      const messageData = data?.message?.message?.message || data?.message?.message || data?.message;
      const timestamp = data?.message?.timestamp;

      // Update state with socket data
      setLiveMessage(messageData);
      setHasSocketData(true); // Mark that socket data has been received

      if (timestamp && onTimestampUpdate) {
        onTimestampUpdate(topic, timestamp);
      }
    };

    if (topicEntry.subscribers === 0) {
      socket.emit("subscribeToTopic", topic);
      socket.on("liveMessage", handleMessage);
      topicEntry.messageHandler = handleMessage;
    }

    topicEntry.subscribers++;

    return () => {
      topicEntry.subscribers--;
      if (topicEntry.subscribers === 0) {
        socket.off("liveMessage", topicEntry.messageHandler);
        socket.emit("unsubscribeFromTopic", topic);
        socket.disconnect();
        socketCache.delete(topic);
      }
    };
  }, [topic, isFFT, onTimestampUpdate]);

  return isFFT ? (
    <td style={{ fontWeight: "bolder" }}>N/A</td>
  ) : (
    <td style={{ fontWeight: "bolder", fontSize: "20px", background: "#34495e", color: "rgb(40, 255, 2)" }}>
      {liveMessage !== null ? liveMessage : "-"}
    </td>
  );
};

export default LiveDataTd;