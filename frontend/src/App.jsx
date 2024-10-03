import React from "react";
import Header from "./Header";
import Home from "./Home";
import AllCustomers from "./Pages/AllCustomers";
import Transaction from "./Pages/Transaction";
import CustomerForm from "./Pages/CustomerForm";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Defaulters from "./Pages/Defaulters";
import ViewGroups from "./Pages/ViewGroups";
import GroupForm from "./Pages/GroupForm";
import { Login } from "@mui/icons-material";
import LoginForm from "./Pages/Login";

function App() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LoginForm />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/managecustomers",
        element: <CustomerForm />,
      },
      {
        path: "/allcustomers",
        element: <AllCustomers />,
      },
      {
        path: "customers/:customerid",
        element: <Transaction />,
      },
      {
        path: "/managegroups",
        element: <GroupForm />,
      },
      {
        path: "/defaulters",
        element: <Defaulters />,
      },
      {
        path: "/viewgroups",
        element: <ViewGroups />,
      },
    ],
  },
]);

export default router;
