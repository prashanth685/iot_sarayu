import React from "react";
import "../index.css";
import { FaUsersCog } from "react-icons/fa";
import DashboardCTitle from "../common/DashboardCTitle";
import { Outlet } from "react-router-dom";

const Users = () => {
  return (
    <div
      className="dashboard_main_section_container"
    >
      <DashboardCTitle title={"Users"} icon={<FaUsersCog />} />
      <Outlet />
    </div>
  );
};

export default Users;
