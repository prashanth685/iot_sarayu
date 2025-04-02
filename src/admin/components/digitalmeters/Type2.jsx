import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import io from "socket.io-client";

const Type2 = ({
  minValue = -500,
  maxValue = 500,
  unit = "",
  tick = 10,
  tickFontSize = "12px",
  topic,
  adminWidth,
  adminHeight,
  darkColor = false,
  label = "n/a",
}) => {
  const [liveData, setLiveData] = useState(0);

  useEffect(() => {
    const socket = io("http://13.127.36.85:4000", {
      path: "/socket.io/",
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      upgrade: false, 
    });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      const value = data?.message?.message?.message ?? 0;
      const boundedValue = Math.min(Math.max(value, minValue), maxValue);
      setLiveData(boundedValue);
    });
    return () => {
      socket.disconnect();
    };
  }, [topic, maxValue, minValue]);

  const generateTicks = (min, max, tickCount) => {
    const ticks = [];
    const step = (max - min) / tickCount;
    for (let current = min; current <= max; current += step) {
      ticks.push({ value: current });
    }
    return ticks;
  };

  const ticks = generateTicks(minValue, maxValue, tick);

  const valueLabelStyle = {
    fontSize: 24,
    ...(darkColor && {
      fill: "#000000",
      color: "#000000",
    }),
  };

  const tickLabelStyle = {
    fontSize: tickFontSize,
    ...(darkColor && {
      fill: "#000000",
      color: "#000000",
    }),
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <GaugeComponent
          arc={{
            nbSubArcs: 150,
            colorArray: ["#5BE12C", "#F5CD19", "#EA4228"],
            width: 0.3,
            padding: 0.003,
          }}
          labels={{
            valueLabel: {
              style: valueLabelStyle,
              formatTextValue: () => `${liveData.toFixed(0)} ${unit}`,
              styleText: darkColor ? { fill: "#000000" } : {},
            },
            tickLabels: {
              type: "outer",
              ticks: ticks,
              defaultTickValueConfig: {
                formatTextValue: (tickValue) =>
                  `${tickValue.toFixed(0)} ${unit}`,
                style: tickLabelStyle,
                styleText: darkColor ? { fill: "#000000" } : {},
              },
            },
          }}
          value={liveData}
          maxValue={maxValue}
          minValue={minValue}
          pointer={{
            animationDuration: 0,
            animationDelay: 0,
            color: darkColor ? "#000000" : undefined,
          }}
        />
        {/* Label Below the Meter */}
        <div
          style={{
            marginTop: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            color: darkColor ? "#000000" : "white",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default Type2;
