import React from "react";
import useFetchData from "./FetchData";
import {
  CircularProgress,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ViewGroups = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const {
    data: groups,
    loading,
    error,
  } = useFetchData("https://vcf-backend.vercel.app/group");

  return (
    <Container
      maxWidth="lg"
      style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}
    >
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <strong>Groups</strong>
        </Typography>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
            Error: {error}
          </div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Group Name</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Months</TableCell>
                  <TableCell>Start Month</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <TableRow key={group._id}>
                      <TableCell>{group.groupname}</TableCell>
                      <TableCell>{group.group}</TableCell>
                      <TableCell>{group.months}</TableCell>
                      <TableCell>{group.startmonth}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} style={{ textAlign: "center" }}>
                      No Group Record Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </Container>
  );
};

export default ViewGroups;
