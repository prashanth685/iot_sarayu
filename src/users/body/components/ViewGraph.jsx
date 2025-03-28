import React, { useEffect, useState } from "react";
import "../../style.css";
import { useNavigate, useParams } from "react-router-dom";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import { IoClose } from "react-icons/io5";
import StaticPlotGraph from "../graphs/rechartsgraph/StaticPlotGraph";
import apiClient from "../../../api/apiClient";

const ViewGraph = () => {
  const { topicparams } = useParams();
  const [topicLabel,setTopicLabel] = useState("")
  const navigate = useNavigate();

  useEffect(()=>{
    fetchLabelApi()
  },[topicparams])

  const fetchLabelApi = async () =>{
      try {
        const res = await apiClient.post('/mqtt/get-single-topic-label',{
          topic : topicparams
        })
        setTopicLabel(res?.data?.data[0]?.label);
      } catch (error) {
        console.log(error.message);
      }
    }

  return (
    <div
      className="_viewgraph_main_container"
      data-aos="fade-out"
      data-aos-duration="1000"
      data-aos-once="true"
    >
      <header>
        <div> 
          {topicLabel}
        </div>
        <div onClick={() => navigate(-1)}>
          <IoClose />
        </div>
      </header>
      <div>
        {topicparams.split("|")[1] === "fft" ? (
          <StaticPlotGraph
            topic={topicparams}
            height={"75dvh"}
            dy={65}
            hidesteps={false}
          />
        ) : (
          <SmallGraph topic={topicparams} height={window.innerWidth < 800 ? window.innerHeight - 160  : window.innerHeight - 230} viewgraph={true} />
        )}
      </div>
    </div>
  );
};

export default ViewGraph;