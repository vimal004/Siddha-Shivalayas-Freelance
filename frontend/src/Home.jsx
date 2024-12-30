import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {
  AccountCircle as AccountCircleIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  ReportProblem as ReportProblemIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import BGIMG from "./img/img3.jpg"; // Adjust path as per your project structure

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const buttonStyles = {
    width: "300px", // Uniform width for all buttons
    borderRadius: "8px",
    textTransform: "none",
    padding: "16px",
    color: "#fff",
    backgroundColor: "#1976d2", // Blue color for all buttons
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      backgroundColor: "#1565c0", // Slightly darker blue on hover
    },
  };

  const iconStyles = {
    marginRight: "8px",
    fontSize: "1.5rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${BGIMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        padding: "24px",
      }}
    >
      <Grid container spacing={3} direction="column" alignItems="center">
        <Grid item>
          <Link to="/allpatients" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={buttonStyles}
              startIcon={<AccountCircleIcon sx={iconStyles} />}
            >
              View Patients Details
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/managepatients" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={buttonStyles}
              startIcon={<PeopleIcon sx={iconStyles} />}
            >
              Manage Patient Records
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/managestocks" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={buttonStyles}
              startIcon={<GroupIcon sx={iconStyles} />}
            >
              Manage Product Stocks
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/generatebill" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={buttonStyles}
              startIcon={<GroupIcon sx={iconStyles} />}
            >
              Generate Bill
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/viewstocks" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={buttonStyles}
              startIcon={<VisibilityIcon sx={iconStyles} />}
            >
              View Product Stocks
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/billhistory" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={buttonStyles}
              startIcon={<VisibilityIcon sx={iconStyles} />}
            >
              View Bill History
            </Button>
          </Link>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
