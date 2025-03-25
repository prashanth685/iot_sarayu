import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { IoCloseOutline } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useParams } from "react-router-dom";
import apiClient from "../../../api/apiClient";
import Loader from "../../../users/loader/Loader";

import Type1 from "../digitalmeters/Type1";
import Type2 from "../digitalmeters/Type2";
import Type3 from "../digitalmeters/Type3";
import Type4 from "../digitalmeters/Type4";
import Type5 from "../digitalmeters/Type5";
import Type6 from "../digitalmeters/Type6";
import Type7 from "../digitalmeters/Type7";

import Type1Img from "./../../../utils/Type1.png";
import Type2Img from "./../../../utils/Type2.png";
import Type3Img from "./../../../utils/Type3.png";
import Type4Img from "./../../../utils/Type4.png";
import Type5Img from "./../../../utils/Type5.png";
import Type6Img from "./../../../utils/Type6.png";
import Type7Img from "./../../../utils/Type7.png";

const DigitalAssignModel = () => {
  const { id, paramsTopic, role } = useParams();
  const [meterType, setMeterType] = useState("");
  const [fetchedUser, setFetchedUser] = useState({});
  const [alreadyAssignedMeter, setAlreadyAssignedMeter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputData, setInputData] = useState({
    minValue: "",
    maxValue: "",
    tick: "",
    label:""
  });

  const [alreadyAssignedMeterName, setAlreadyAssignedMeterName] = useState("");

  useEffect(() => {
    fetchSelectedUser();
  }, [id]);

  const fetchSelectedUser = async () => {
    try {
      const res = await apiClient.get(`/auth/${role}/${id}`);
      setFetchedUser(res?.data?.data);
      const assignedMeter = res?.data?.data?.assignedDigitalMeters?.find(
        (item) => item.topic.toLowerCase() === paramsTopic.toLowerCase()
      );
      setAlreadyAssignedMeter(assignedMeter);

      if (assignedMeter) {
        setAlreadyAssignedMeterName(assignedMeter.meterType);
        setInputData({
          minValue: assignedMeter.minValue,
          maxValue: assignedMeter.maxValue,
          tick: assignedMeter.ticks,
          label:assignedMeter.label
        });
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const carouselRef = useRef(null);

  const handleRightScroll = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 400;
    }
  };

  const handleLeftScroll = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 400;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAssign = async () => {
    const minValue = parseFloat(inputData.minValue);
    const maxValue = parseFloat(inputData.maxValue);
    const tick = parseInt(inputData.tick, 10);

    // if (isNaN(minValue) || isNaN(maxValue) || isNaN(tick)) {
    //   alert("Please enter valid numbers for min, max, and ticks.");
    //   return;
    // }

    try {
      const body = {
        assignedDigitalMeters: [
          {
            topic: paramsTopic,
            meterType: alreadyAssignedMeterName,
            minValue: minValue,
            maxValue: maxValue,
            ticks: tick,
            label:inputData.label
          },
        ],
      };
      await apiClient.put(`/auth/digitalmeter/${role}/${id}`, body);
      window.location.reload();
      console.log("Digital meter assigned successfully!");
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const alreadyAssignedMinValue = Number(alreadyAssignedMeter?.minValue) || 0;
  const alreadyAssignedMaxValue = Number(alreadyAssignedMeter?.maxValue) || 0;
  const alreadyAssignedLabel = alreadyAssignedMeter?.label || "";
  const alreadyAssignedTick = Number(alreadyAssignedMeter?.ticks) || 0;

  return (
    <div className="_admin_assign_meter_main_container">
      <div className="_admin_assign_meter_container">
        <header>
          <p>{fetchedUser?.email}</p>
          <div
            className="_admin_assign_meter_close"
            onClick={() => window.close()}
          >
            <IoCloseOutline color="white" size={"20"} />
          </div>
        </header>
        <section>
          <p>{paramsTopic}</p>
        </section>
        <section
          ref={carouselRef}
          className="_admin_assign_meter_carousel_container"
        >
          <section
            className="_admin_assign_meter_carousel_left_button_container"
            onClick={handleLeftScroll}
          >
            <div className="_admin_assign_meter_carousel_left_button">
              <FaChevronLeft />
            </div>
          </section>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type1")}
            className={
              alreadyAssignedMeterName === "Type1" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type1Img} alt="meter type one" />
          </div>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type2")}
            className={
              alreadyAssignedMeterName === "Type2" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type2Img} alt="meter type two" />
          </div>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type3")}
            className={
              alreadyAssignedMeterName === "Type3" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type3Img} alt="meter type three" />
          </div>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type4")}
            className={
              alreadyAssignedMeterName === "Type4" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type4Img} alt="meter type four" />
          </div>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type5")}
            className={
              alreadyAssignedMeterName === "Type5" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type5Img} alt="meter type five" />
          </div>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type6")}
            className={
              alreadyAssignedMeterName === "Type6" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type6Img} alt="meter type six" />
          </div>
          <div
            onClick={() => setAlreadyAssignedMeterName("Type7")}
            className={
              alreadyAssignedMeterName === "Type7" &&
              `_admin_assign_meter_carousel_container_active_meter`
            }
          >
            <img src={Type7Img} alt="meter type seven" />
          </div>
          <section
            className="_admin_assign_meter_carousel_right_button_container"
            onClick={handleRightScroll}
          >
            <div className="_admin_assign_meter_carousel_right_button">
              <FaChevronRight />
            </div>
          </section>
        </section>
        <section className="_admin_assign_digital_meter_and_edit_main_container">
          <div className="_admin_assign_digital_meter_edit_container">
            <div>
              <p>
                Edit the values and assign the digital meter for the selected
                topic
              </p>
              <div className="_admin_assign_digital_meter_edit_input_container">
                <input
                  type="text"
                  name="minValue"
                  value={inputData.minValue}
                  onChange={handleChange}
                  placeholder="Enter the minimum value"
                />
              </div>
              <div className="_admin_assign_digital_meter_edit_input_container">
                <input
                  type="text"
                  name="maxValue"
                  value={inputData.maxValue}
                  onChange={handleChange}
                  placeholder="Enter the maximum value"
                />
              </div>
              <div className="_admin_assign_digital_meter_edit_input_container">
                <input
                  type="text"
                  name="label"
                  value={inputData.label}
                  onChange={handleChange}
                  placeholder="Enter the label"
                />
              </div>
              {alreadyAssignedMeterName === "Type2" && <div className="_admin_assign_digital_meter_edit_input_container">
                <select
                  name="tick"
                  value={inputData.tick}
                  onChange={handleChange}
                >
                  <option value="">Select the number of ticks</option>
                  {Array.from({ length: 20 }, (_, i) => i + 2).map((tick) => (
                    <option key={tick} value={tick}>
                      {tick}
                    </option>
                  ))}
                </select>
              </div>}
              <div className="_admin_assign_digital_meter_edit_save_button">
                <button onClick={handleAssign}>Assign</button>
              </div>
            </div>
          </div>
          <div className="_admin_assign_digital_meter_view_container">
            {!alreadyAssignedMeter ? (
              <div className="_admin_assign_digital_meter_view_not_selected_message_container">
                <p>No Meter selected...!</p>
              </div>
            ) : (
              <div>
                {alreadyAssignedMeterName === "Type1" && (
                  <Type1
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    topic={paramsTopic}
                    label={alreadyAssignedLabel}
                  />
                )}
                {alreadyAssignedMeterName === "Type2" && (
                  <Type2
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    value={30}
                    tick={alreadyAssignedTick || 5}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    topic={paramsTopic}
                    adminWidth="500px"
                    adminHeight="400px"
                    label={alreadyAssignedLabel}
                  />
                )}
                {alreadyAssignedMeterName === "Type3" && (
                  <Type3
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    topic={paramsTopic}
                    label={alreadyAssignedLabel}
                  />
                )}
                {alreadyAssignedMeterName === "Type4" && (
                  <Type4
                    topic={paramsTopic}
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    label={alreadyAssignedLabel}
                  />
                )}
                {alreadyAssignedMeterName === "Type5" && (
                  <Type5
                    topic={paramsTopic}
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    label={alreadyAssignedLabel}
                  />
                )}
                {alreadyAssignedMeterName === "Type6" && (
                  <Type6
                    topic={paramsTopic}
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    label={alreadyAssignedLabel}
                  />
                )}
                {alreadyAssignedMeterName === "Type7" && (
                  <Type7
                    topic={paramsTopic}
                    minValue={alreadyAssignedMinValue}
                    maxValue={alreadyAssignedMaxValue}
                    unit={
                      paramsTopic.includes("|") ? paramsTopic.split("|")[1] : ""
                    }
                    label={alreadyAssignedLabel}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DigitalAssignModel;
