import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Snackbar,
  CircularProgress,
  Grid,
  Typography,
  Container,
  Autocomplete,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const PatientForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    address: '',
    // Removed: treatmentOrMedicine: '',
    date: '',
  });

  const [patients, setPatients] = useState([]); // For auto-complete suggestions
  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(false); // For success Snackbar
  const [errorMessage, setErrorMessage] = useState(''); // For error Snackbar
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState(false); // To track if we are updating or creating

  // --- START: New function to fetch patients and set the next ID ---
  const fetchPatientsAndSetNextId = () => {
    axios
      .get('https://siddha-shivalayas-backend.vercel.app/patients')
      .then(response => {
        const fetchedPatients = response.data;
        setPatients(fetchedPatients);

        let nextId = '1'; // Default if no patients exist
        if (fetchedPatients.length > 0) {
          const numericIds = fetchedPatients.map(p => parseInt(p.id, 10)).filter(id => !isNaN(id));

          if (numericIds.length > 0) {
            const maxId = Math.max(...numericIds);
            nextId = String(maxId + 1);
          }
        }

        // Reset the form to a "new patient" state with the next available ID
        setFormData({
          id: nextId,
          name: '',
          phone: '',
          address: '',
          // Removed: treatmentOrMedicine: '',
          date: '',
        });
        setIsExistingPatient(false); // We are in "create new" mode
      })
      .catch(error => {
        console.error('Error fetching patients:', error);
        setErrorMessage('Could not fetch patient data.');
      });
  };
  // --- END: New function ---

  // --- MODIFIED: useEffect to call the new function on load ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetchPatientsAndSetNextId();
    }
  }, [navigate]);
  // --- END: Modified useEffect ---

  const handleDelete = () => {
    setLoadingDelete(true);
    axios
      .delete(`https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`)
      .then(() => {
        setDeleted(true);
        setSuccess(true);
        fetchPatientsAndSetNextId(); // Refresh list and reset form
        setLoadingDelete(false);
        setTimeout(() => setDeleted(false), 3000);
      })
      .catch(err => {
        console.error(err);
        setLoadingDelete(false);
        setErrorMessage('Patient deletion failed');
        setSuccess(false);
      });
  };

  const handleUpdate = () => {
    setLoadingUpdate(true);
    axios
      .put(`https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`, formData)
      .then(() => {
        setUpdated(true);
        setSuccess(true);
        fetchPatientsAndSetNextId(); // Refresh list and reset form
        setLoadingUpdate(false);
        setTimeout(() => setUpdated(false), 3000);
      })
      .catch(err => {
        console.error(err);
        setLoadingUpdate(false);
        setErrorMessage('Patient update failed');
        setSuccess(false);
      });
  };

  const handleCreate = e => {
    e.preventDefault();
    setLoadingCreate(true);
    if (!formData.id) {
      setErrorMessage('Patient ID is required');
      setSuccess(false);
      setLoadingCreate(false);
      return;
    }

    axios
      .post('https://siddha-shivalayas-backend.vercel.app/patients', formData)
      .then(() => {
        setCreated(true);
        setSuccess(true);
        fetchPatientsAndSetNextId(); // Refresh list and reset form
        setLoadingCreate(false);
        setTimeout(() => setCreated(false), 3000);
      })
      .catch(err => {
        console.error(err);
        setSuccess(false);
        setErrorMessage('Patient creation failed');
        setLoadingCreate(false);
      });
  };

  // --- MODIFIED: handleAutocompleteChange to manage form state ---
  const handleAutocompleteChange = (event, value) => {
    if (value) {
      // If a patient is selected, fill the form with their data
      setFormData(value);
      setIsExistingPatient(true);
    } else {
      // If the selection is cleared, reset to "new patient" mode
      fetchPatientsAndSetNextId();
    }
  };
  // --- END: Modified handleAutocompleteChange ---

  const isIdEntered = formData.id.trim() !== '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            borderRadius: 2,
            p: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'primary.main',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {isExistingPatient ? 'Update Patient' : 'Create New Patient'}
          </Typography>

          <Autocomplete
            options={patients}
            getOptionLabel={option => `${option.id} - ${option.name}` || ''}
            sx={{ mb: 3 }}
            onChange={handleAutocompleteChange}
            renderInput={params => (
              <TextField {...params} label="Search Existing Patient by ID or Name" fullWidth />
            )}
          />

          <form onSubmit={handleCreate}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                {/* --- MODIFIED: Patient ID field is now read-only --- */}
                <TextField
                  label="Patient ID"
                  name="id"
                  value={formData.id}
                  variant="outlined"
                  fullWidth
                  required
                  InputProps={{
                    readOnly: true,
                    style: { backgroundColor: '#f5f5f5', color: '#757575' },
                  }}
                  helperText="ID is auto-generated for new patients."
                />
                {/* --- END: Modified field --- */}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Patient Name"
                  name="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date ? formData.date.split('T')[0] : ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!isIdEntered || loadingCreate || isExistingPatient}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}
                >
                  {loadingCreate ? <CircularProgress size={24} color="inherit" /> : 'Create'}
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  disableElevation
                  disabled={!isIdEntered || loadingUpdate || !isExistingPatient}
                  onClick={handleUpdate}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}
                >
                  {loadingUpdate ? <CircularProgress size={24} color="inherit" /> : 'Update'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  disableElevation
                  disabled={!isIdEntered || loadingDelete || !isExistingPatient}
                  onClick={handleDelete}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}
                >
                  {loadingDelete ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
                </Button>
              </Box>
            </Grid>
          </form>

          <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
            <MuiAlert severity="success" variant="filled">
              {created
                ? 'Created successfully!'
                : updated
                ? 'Updated successfully!'
                : deleted
                ? 'Deleted successfully!'
                : ''}
            </MuiAlert>
          </Snackbar>

          <Snackbar
            open={!!errorMessage}
            autoHideDuration={3000}
            onClose={() => setErrorMessage('')}
          >
            <MuiAlert severity="error" variant="filled">
              {errorMessage}
            </MuiAlert>
          </Snackbar>
        </Box>
      </Container>
    </Box>
  );
};

export default PatientForm;