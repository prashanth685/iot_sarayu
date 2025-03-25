import React, { useEffect, useState } from "react";
import "../../style.css";
import { useSelector, useDispatch } from "react-redux";
import apiClient from "../../../api/apiClient";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import { toast } from "react-toastify";
import Loader from "../../loader/Loader";
import LiveDataTd from "../common/LiveDataTd";
import { IoMdRemoveCircle } from "react-icons/io";
import { BiSolidReport } from "react-icons/bi";
import WeekTd from "../common/WeekTd";
import YestardayTd from "../common/YestardayTd";
import TodayTd from "../common/TodayTd";
import { VscGraph } from "react-icons/vsc";
import { FaDigitalOcean } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdEdit } from "react-icons/md";

const Dashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userSlice);
  const [favoriteList, setFavoriteList] = useState([]);
  const navigate = useNavigate();
  const [rmFavModel, setRmFavModel] = useState(false);
  const [topicToRm, setTopicToRm] = useState(null);

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  const fetchUserDetails = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      const userData = res?.data?.data;
      setLoggedInUser(userData);
      dispatch(setUserDetails(userData));
      setFavoriteList(userData?.favorites || []);
      setLocalLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      setLocalLoading(false);
    }
  };

  // Helper to ensure we have a consistent favorite object.
  const parseFavorite = (fav) => {
    if (typeof fav === "string") {
      // Assuming the favorite string is formatted like "some/url|unit"
      const parts = fav.split("|");
      const urlPart = parts[0] || "";
      const urlParts = urlPart.split("/");
      // Extract tagName from the third segment, fallback to the entire URL part
      const tagName = urlParts[2] || urlPart;
      const unit = parts[1] || "";
      return { topic: fav, tagName, unit, isFFT: false };
    }
    return fav;
  };

  const handleRemoveFavorite = async (favorite) => {
    try {
      await apiClient.delete(`/auth/${user.role}/${user.id}/favorites`, {
        data: { topic: favorite.topic },
      });
      setFavoriteList((prev) =>
        prev.filter((fav) => {
          const parsed = parseFavorite(fav);
          return parsed.topic !== favorite.topic;
        })
      );
      toast.success("Topic removed from watchlist");
      // Optionally refresh the user details
      fetchUserDetails();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to remove topic from watchlist"
      );
    }
  };

  if (localLoading) {
    return <Loader />;
  }

  return (
    <div className="allusers_dashboard_main_container">
      {rmFavModel && (
        <div className="watchlist_remove_model_container">
          <div>
            <p>
              Are you sure you want to remove{" "}
              <span
                style={{
                  color: "red",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                {topicToRm?.tagName}
              </span>{" "}
              from watchlist...!
            </p>
            <div>
              <button
                onClick={() => {
                  handleRemoveFavorite(topicToRm);
                  setRmFavModel(false);
                  setTopicToRm(null);
                }}
              >
                Remove
              </button>
              <button
                onClick={() => {
                  setRmFavModel(false);
                  setTopicToRm(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="alluser_alloperators_container">
        <div className="alluser_alloperators_scrollable-table">
          <table className="alluser_alloperators_table">
            <thead>
              <tr>
                <th style={{ background: "red" }}>TagName</th>
                <th
                  className="allusers_dashboard_live_data_th"
                  style={{ background: "rgb(150, 2, 208)" }}
                >
                  Live
                </th>
                <th>Unit</th>
                <th>TodayMax</th>
                <th>YesterdayMax</th>
                <th>WeekMax</th>
                <th>Report</th>
                <th>LayoutView</th>
                <th>Edit/Graph/Digital</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {favoriteList.map((fav, index) => {
                const parsed = parseFavorite(fav);
                return (
                  <tr key={`${parsed.topic}-${index}`}>
                    <td style={{ background: "#34495e", color: "white" }}>
                      {parsed.tagName}
                    </td>
                    <LiveDataTd topic={parsed.topic} />
                    <td style={{ background: "#34495e", color: "white" }}>
                      {parsed.unit}
                    </td>
                    <TodayTd topic={parsed.topic} />
                    <YestardayTd topic={parsed.topic} />
                    <WeekTd topic={parsed.topic} />
                    <td>
                      {!parsed.isFFT && (
                        <BiSolidReport
                          size={20}
                          style={{ cursor: "pointer", color: "gray" }}
                          className="icon"
                          onClick={() =>
                            navigate(
                              `/allusers/report/${encodeURIComponent(
                                parsed.topic
                              )}`
                            )
                          }
                        />
                      )}
                    </td>
                    <td>
                      <LuLayoutDashboard
                        size={20}
                        style={{ cursor: "pointer", color: "gray" }}
                        className="icon"
                        onClick={() =>
                          navigate(
                            `/allusers/layoutview/${encodeURIComponent(
                              parsed.topic
                            )}/${loggedInUser?.layout}`
                          )
                        }
                      />
                    </td>
                    <td className="allusers_dashboard_graph_digital_td">
                      {!parsed.isFFT && (
                        <button
                          onClick={() =>
                            navigate(
                              `/allusers/editsinglegraph/${encodeURIComponent(
                                parsed.topic
                              )}`
                            )
                          }
                        >
                          <MdEdit
                            size={18}
                            style={{ cursor: "pointer" }}
                            className="icon"
                          />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(
                            `/allusers/viewsinglegraph/${encodeURIComponent(
                              parsed.topic
                            )}`
                          )
                        }
                      >
                        <VscGraph style={{ cursor: "pointer" }} />
                      </button>
                      {!parsed.isFFT && (
                        <button
                          onClick={() =>
                            navigate(
                              `/allusers/singledigitalmeter/${encodeURIComponent(
                                parsed.topic
                              )}/${user.role}/${user.id}`
                            )
                          }
                        >
                          <FaDigitalOcean style={{ cursor: "pointer" }} />
                        </button>
                      )}
                    </td>
                    <td>
                      <IoMdRemoveCircle
                        color="red"
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setRmFavModel(true);
                          setTopicToRm(parsed);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
