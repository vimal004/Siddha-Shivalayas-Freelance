import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  CircularProgress,
  Container,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  Button,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const Transaction = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const { customerid } = useParams();
  const [customers, setCustomers] = useState(null);
  const [filteredCustomer, setFilteredCustomer] = useState({});
  const [tdat, setTdat] = useState(null);
  const [gdat, setGdat] = useState(null);
  const [existvalues, setExistValues] = useState(null);
  const [inputValues, setInputValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://vcf-backend.vercel.app/customers")
      .then((response) => {
        setCustomers(response?.data?.data);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://vcf-backend.vercel.app/group")
      .then((response) => {
        setTdat(response?.data?.data);
      })
      .catch((error) => {
        console.error("Error fetching group:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`https://vcf-backend.vercel.app/group/transaction`, {
        params: { id: customerid },
      })
      .then((res) => {
        setExistValues(res?.data?.data?.data);
        setLoading(false); // Mark loading as complete
      })
      .catch((err) => {
        console.log(err);
      });
  }, [customerid]);

  useEffect(() => {
    if (tdat && filteredCustomer) {
      const filteredGroup = tdat.find((d) => d.group == filteredCustomer.group);
      setGdat(filteredGroup);
    }
  }, [tdat, filteredCustomer]);

  useEffect(() => {
    if (customers) {
      const customer = customers.find((customer) => customer.id === customerid);
      setFilteredCustomer(customer || {});
    }
  }, [customers, customerid]);

  useEffect(() => {
    if (gdat && existvalues) {
      setInputValues(
        Array.from({ length: gdat.months }, (_, index) => ({
          auctionDate: existvalues[index]?.auctionDate || "",
          dueDate: existvalues[index]?.dueDate || "",
          remainingAmount: existvalues[index]?.remainingAmount || "",
          dueAmount: existvalues[index]?.dueAmount || "",
          paidAmount: existvalues[index]?.paidAmount || "",
          status: existvalues[index]?.status || "Pending",
        }))
      );
    }
  }, [gdat, existvalues]);

  const handleInputChange = (e, rowIndex, field) => {
    const { value } = e.target;
    setInputValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[rowIndex][field] = value;
      return newValues;
    });
  };

  const handleUpdate = () => {
    axios
      .put("https://vcf-backend.vercel.app/group/transaction", {
        id: customerid,
        data: inputValues,
      })
      .then((res) => {
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Error updating transaction:", err);
      });
  };

  const handleGeneratePDF = () => {
    const input = contentRef.current;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgHeight = (canvas.height * 208) / canvas.width;
      pdf.addImage(imgData, 0, 0, 208, imgHeight);
      pdf.save("transaction.pdf");
      setPdfGenerated(true);
      setTimeout(() => {
        setPdfGenerated(false);
      }, 3000);
    });
  };

  const handleCloseSuccessMessage = () => {
    setSuccessMessage(false);
  };

  const handleClosePdfGenerated = () => {
    setPdfGenerated(false);
  };

  return (
    <Container maxWidth="lg" className="mt-10 p-4">
      <Typography variant="h3" align="center" className="mb-8">
        <strong>Transaction Page</strong>
      </Typography>
      {gdat && (
        <Typography variant="h5" align="center" className="mb-8">
          <strong>{gdat.groupname}</strong>
        </Typography>
      )}
      <Card variant="outlined" className="mb-8">
        <CardContent>
          <Typography variant="h6" className="font-semibold">
            <strong>Customer Details</strong>
          </Typography>
          <Typography variant="body1" className="mt-2">
            <strong>ID:</strong> {customerid}
          </Typography>
          <Typography variant="body1" className="mt-2">
            <strong>Name:</strong> {filteredCustomer.name || "N/A"}
          </Typography>
          <Typography variant="body1" className="mt-2">
            <strong>Phone:</strong> {filteredCustomer.phno || "N/A"}
          </Typography>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <div className="overflow-x-auto" ref={contentRef}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Auction Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Remaining Amount</TableCell>
                  <TableCell>Due Amount</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gdat && gdat.months > 0 ? (
                  Array.from({ length: gdat.months }, (_, index) => {
                    const startMonthIndex = new Date(
                      gdat.startmonth + "/1/2000"
                    ).getMonth();
                    const currentMonthIndex = (startMonthIndex + index) % 12;
                    const currentMonthName = new Intl.DateTimeFormat("en-US", {
                      month: "long",
                    }).format(new Date(2000, currentMonthIndex, 1));

                    return (
                      <TableRow key={index}>
                        <TableCell>{currentMonthName}</TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={inputValues[index]?.auctionDate || ""}
                            onChange={(e) =>
                              handleInputChange(e, index, "auctionDate")
                            }
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={inputValues[index]?.dueDate || ""}
                            onChange={(e) =>
                              handleInputChange(e, index, "dueDate")
                            }
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={inputValues[index]?.remainingAmount || ""}
                            onChange={(e) =>
                              handleInputChange(e, index, "remainingAmount")
                            }
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={inputValues[index]?.dueAmount || ""}
                            onChange={(e) =>
                              handleInputChange(e, index, "dueAmount")
                            }
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={inputValues[index]?.paidAmount || ""}
                            onChange={(e) =>
                              handleInputChange(e, index, "paidAmount")
                            }
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={inputValues[index]?.status || ""}
                            onChange={(e) =>
                              handleInputChange(e, index, "status")
                            }
                            variant="standard"
                            fullWidth
                          >
                            <MenuItem value="">Select Status</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Defaulter">Unpaid</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>No transactions found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      <div className="mt-4 space-x-4">
        <Button
          onClick={handleUpdate}
          variant="contained"
          color="primary"
          className="mr-2"
        >
          Update Details
        </Button>
        <Button onClick={handleGeneratePDF} variant="contained" color="success">
          Generate PDF
        </Button>
      </div>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSuccessMessage}
          severity="success"
        >
          Details Updated Successfully!
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={pdfGenerated}
        autoHideDuration={3000}
        onClose={handleClosePdfGenerated}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleClosePdfGenerated}
          severity="success"
        >
          PDF Generated Successfully!
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Transaction;
