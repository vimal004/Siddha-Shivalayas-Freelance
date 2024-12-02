import React from "react";
import Header from "./Header";
import Home from "./Home";
import Transaction from "./Pages/Transaction";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Defaulters from "./Pages/Defaulters";
import ViewStocks from "./Pages/ViewStocks";
import StockForm from "./Pages/StockForm";
import LoginForm from "./Pages/Login";
import PatientForm from "./Pages/PatientForm";
import AllPatients from "./Pages/AllPatients";

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
        path: "/managepatients",
        element: <PatientForm />,
      },
      {
        path: "/allpatients",
        element: <AllPatients />,
      },
      {
        path: "customers/:customerid",
        element: <Transaction />,
      },
      {
        path: "/managestocks",
        element: <StockForm />, 
      },
      {
        path: "/defaulters",
        element: <Defaulters />,
      },
      {
        path: "/viewstocks",
        element: <ViewStocks />,
      },
      {
        path: "/generatebill",
        element: <Transaction />, 
      }
    ],
  },
]);

export default router;
