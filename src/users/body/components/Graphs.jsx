import React, { useContext, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../redux/slices/UniversalLoader";
import apiClient from "../../../api/apiClient";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import { toast } from "react-toastify";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import "../../style.css";
import { FaRegEye } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import Loader from "../../loader/Loader";
import { useNavigate } from "react-router-dom";
import StaticPlotGraph from "../graphs/rechartsgraph/StaticPlotGraph";
import { navHeaderContaxt } from "../../../contaxts/navHeaderContaxt";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const { navHeader } = useContext(navHeaderContaxt);
  const [currentPage, setCurrentPage] = useState(0);
  const [statsData, setStatsData] = useState({});
  const [allTopicsWithLabels, setAllTopicsWithLabels] = useState([]);
  const itemsPerPage = 4;

  // State to store time range for each topic
  const [timeRanges, setTimeRanges] = useState({});
  // State to track which topics are currently being fetched
  const [fetchingTopics, setFetchingTopics] = useState(new Set());

  useEffect(() => {
    fetchAllTopicsLabels();
  }, []);

  const fetchAllTopicsLabels = async () => {
    try {
      const res = await apiClient.get(`/mqtt/all-topics-labels`);
      setAllTopicsWithLabels(res.data.data);
    } catch (error) {
      console.log(error.message);
      toast.error("Failed to fetch topic labels");
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  const fetchUserDetails = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
      dispatch(setUserDetails(res?.data?.data));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch user details");
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchStatsForTopic = useCallback(async (topic, timeRange) => {
    // Skip if already fetching for this topic
    if (fetchingTopics.has(topic)) {
      return;
    }

    setFetchingTopics((prev) => {
      const newSet = new Set(prev);
      newSet.add(topic);
      return newSet;
    });

    try {
      const now = new Date();
      let from;

      switch (timeRange) {
        case "24 hours":
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "2 days":
          from = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
          break;
        case "3 days":
          from = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case "1 week":
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "1 month":
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const res = await apiClient.post(`/mqtt/graph-min-max-avg`, {
        topics: [topic],
        from: from.toISOString(),
        to: now.toISOString(),
      });

      setStatsData((prev) => ({
        ...prev,
        [topic]: res.data[topic] || { avg: "N/A", min: null, max: null },
      }));
    } catch (error) {
      console.error(`Error fetching stats for topic ${topic}:`, error);
      toast.error(`Failed to fetch stats for ${getTopicLabel(topic)}: ${error.message}`);
      // Set default stats in case of failure to prevent further errors
      setStatsData((prev) => ({
        ...prev,
        [topic]: { avg: "N/A", min: null, max: null },
      }));
    } finally {
      setFetchingTopics((prev) => {
        const newSet = new Set(prev);
        newSet.delete(topic);
        return newSet;
      });
    }
  }, [fetchingTopics]);

  useEffect(() => {
    const topics =
      user.role === "supervisor" && navHeader?.topics?.length > 0
        ? navHeader.topics
        : loggedInUser?.graphwl?.length > 0
        ? loggedInUser.graphwl
        : [];

    if (topics.length > 0) {
      // Initialize time ranges for each topic to "24 hours" if not already set
      const initialTimeRanges = {};
      let needsUpdate = false;
      topics.forEach((topic) => {
        if (!timeRanges[topic]) {
          initialTimeRanges[topic] = "24 hours";
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        setTimeRanges((prev) => ({ ...prev, ...initialTimeRanges }));
      }

      // Fetch stats for each topic based on its time range
      topics.forEach((topic) => {
        const timeRange = timeRanges[topic] || "24 hours";
        fetchStatsForTopic(topic, timeRange);
      });
    }
  }, [navHeader?.topics, loggedInUser?.graphwl, user.role, fetchStatsForTopic]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // For supervisors: Use navHeader.topics, paginated
  const supervisorTopics = navHeader?.topics || [];
  const pageCount = Math.ceil(supervisorTopics.length / itemsPerPage);
  const currentSupervisorTopics = supervisorTopics.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // For non-supervisors: Use graphwl, no pagination
  const graphwlTopics = loggedInUser?.graphwl || [];

  // Function to get the label for a topic
  const getTopicLabel = (topic) => {
    const matchedTopic = allTopicsWithLabels.find((t) => t.topic === topic);
    if (matchedTopic) {
      return matchedTopic.label;
    }
    return topic.split("|")[0].split("/")[2];
  };

  if (localLoading) {
    return <Loader />;
  }

  // Non-supervisor: Show graphwl graphs
  if (user.role !== "supervisor") {
    if (graphwlTopics.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            color: "gray",
          }}
        >
          <h3>No Graphs Available!</h3>
        </div>
      );
    }

    return (
      <div>
        <div className="manager_graphs_list_main_container">
          {graphwlTopics.map((item, index) => {
            const topicStats = statsData[item] || {};
            const unit = item.split("|")[1] || "";
            const isFft = unit === "fft";
            return (
              <div key={index} className="manager_graph_avg_max_min_container">
                <div className="manager_graph_avg_max_min_second_container">
                  <header className="manager_graph_avg_max_min_second_container_header">
                    {getTopicLabel(item)}
                  </header>
                  <select
                    value={timeRanges[item] || "24 hours"}
                    onChange={(e) => {
                      const newTimeRange = e.target.value;
                      setTimeRanges((prev) => ({
                        ...prev,
                        [item]: newTimeRange,
                      }));
                    }}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #34495e",
                      borderRadius: "4px",
                      fontSize: "14px",
                      color: "#ffffff",
                      backgroundColor: "#2c3e50",
                      cursor: "pointer",
                      outline: "none",
                      marginTop: "8px",
                      marginBottom: "8px",
                      width: "120px",
                    }}
                  >
                    <option value="24 hours">24 Hours</option>
                    <option value="2 days">2 Days</option>
                    <option value="3 days">3 Days</option>
                    <option value="1 week">1 Week</option>
                    <option value="1 month">1 Month</option>
                  </select>
                  <div className="manager_graphs_average_container mt-3">
                    <div style={{ fontSize: "20px" }}>AVG</div>
                    <div style={{ fontSize: "20px" }}>
                      {topicStats.avg ?? "N/A"} {unit}
                    </div>
                  </div>
                  <div className="manager_graph_min_max_container">
                    <div className="manager_graph_min_container">
                      <div>Min</div>
                      <div>
                        {topicStats.min?.value ?? "N/A"} {unit}
                        <br />
                        <span>{formatDateTime(topicStats.min?.time)}</span>
                      </div>
                    </div>
                    <div className="manager_graph_max_container">
                      <div>Max</div>
                      <div>
                        {topicStats.max?.value ?? "N/A"} {unit}
                        <br />
                        <span>{formatDateTime(topicStats.max?.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="_manager_graph_container">
                  {isFft ? (
                    <StaticPlotGraph topic={item} height={290} dy={70} hidesteps={true} />
                  ) : (
                    <SmallGraph topic={item} height={window.innerWidth < 800 ? 195 : 243} viewgraph />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (supervisorTopics.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
          color: "gray",
        }}
      >
        <h3>No Topics Available for {navHeader?.headerOne || "Selected User"}!</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="manager_graphs_list_main_container">
        {currentSupervisorTopics.map((item, index) => {
          const topicStats = statsData[item] || {};
          const unit = item.split("|")[1] || "";
          const isFft = unit === "fft";
          return (
            <div key={index} className="manager_graph_avg_max_min_container">
              <div className="manager_graph_avg_max_min_second_container">
                <header className="manager_graph_avg_max_min_second_container_header">
                  {getTopicLabel(item)}
                </header>
                <select
                  value={timeRanges[item] || "24 hours"}
                  onChange={(e) => {
                    const newTimeRange = e.target.value;
                    setTimeRanges((prev) => ({
                      ...prev,
                      [item]: newTimeRange,
                    }));
                  }}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #34495e",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#ffffff",
                    backgroundColor: "#2c3e50",
                    cursor: "pointer",
                    outline: "none",
                    width:"100%",
                    marginTop: "8px",
                    marginBottom: "8px",
                    textAlign:"center"
                  }}
                >
                  <option value="24 hours">24 Hours</option>
                  <option value="2 days">2 Days</option>
                  <option value="3 days">3 Days</option>
                  <option value="1 week">1 Week</option>
                  <option value="1 month">1 Month</option>
                </select>
                <div className="manager_graphs_average_container">
                  <div>AVG</div>
                  <div>
                    {topicStats.avg ?? "N/A"} {unit}
                  </div>
                </div>
                <div className="manager_graph_min_max_container">
                  <div className="manager_graph_min_container">
                    <div>Min</div>
                    <div>
                      {topicStats.min?.value ?? "N/A"} {unit}
                      <br />
                      <span>{formatDateTime(topicStats.min?.time)}</span>
                    </div>
                  </div>
                  <div className="manager_graph_max_container">
                    <div>Max</div>
                    <div>
                      {topicStats.max?.value ?? "N/A"} {unit}
                      <br />
                      <span>{formatDateTime(topicStats.max?.time)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="_manager_graph_container">
                {isFft ? (
                  <StaticPlotGraph topic={item} height={290} dy={70} hidesteps={true} />
                ) : (
                  <SmallGraph topic={item} height={window.innerWidth < 800 ? 195 : 243} viewgraph />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="d-flex justify-content-center mt-4 mb-4">
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          breakLabel="..."
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={2}
          onPageChange={handlePageClick}
          containerClassName="pagination"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          activeClassName="active"
          disabledClassName="disabled"
          forcePage={currentPage}
        />
      </div>
    </div>
  );
};

export default Dashboard;