import React, { useEffect, useState, useMemo } from "react";
import "../../style.css";
import io from "socket.io-client";

const socketCache = new Map();

const getCachedSocket = (topic) => {
  if (!socketCache.has(topic)) {
    const newSocket = io("http://13.203.94.55:4000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
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
  const isFFT = useMemo(() => topic.split("|")[1] === "fft", [topic]);

  useEffect(() => {
    if (isFFT) return;

    const topicEntry = getCachedSocket(topic);
    const { socket } = topicEntry;

    const handleMessage = (data) => {
      // console.log(`Message received for ${topic}:`, data);
      const messageData = data?.message?.message?.message || data?.message?.message || data?.message;
      const timestamp = data?.message?.timestamp;
      setLiveMessage(messageData);
      if (timestamp && onTimestampUpdate) {
        onTimestampUpdate(topic, timestamp);
      }
    };

    if (topicEntry.subscribers === 0) {
      socket.emit("subscribeToTopic", topic);
      // console.log(`Subscribed to ${topic}`);
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
    <td style={{ fontWeight: "bolder", background: "#34495e", color: "rgb(255, 255, 255)" }}>
      {liveMessage !== null ? liveMessage : "-"}
    </td>
  );
};

export default LiveDataTd;