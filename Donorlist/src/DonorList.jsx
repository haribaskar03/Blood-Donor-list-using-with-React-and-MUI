import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  IconButton,
  InputAdornment,
  Stack,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Tooltip
} from "@mui/material";
import { Search, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const initialDonationData = [
  {
    id: 1,
    date: "01-04-2025",
    donor: "Mark Cooper",
    contact: "09798665781",
    bloodType: "A-",
    volume: 500,
  },
  {
    id: 2,
    date: "02-04-2025",
    donor: "Samantha Jane Miller",
    contact: "90475207544",
    bloodType: "O+",
    volume: 450,
  },
  {
    id: 3,
    date: "03-04-2025",
    donor: "Claire Blake",
    contact: "6598365943",
    bloodType: "AB+",
    volume: 400,
  },
  {
    id: 4,
    date: "04-05-2025",
    donor: "David Jhon",
    contact: "0753075033",
    bloodType: "O+",
    volume: 400,
  },
  {
    id: 5,
    date: "05-05-2025",
    donor: "Sara William",
    contact: "9649265902",
    bloodType: "AB-",
    volume: 350,
  },
];

const schema = yup.object().shape({
  date: yup.date().required("Date is required"),
  donor: yup.string().required("Donor name is required"),
  contact: yup.string()
    .required("Contact is required")
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, "Must be at least 10 digits")
    .max(15, "Must be 15 digits or less"),
  bloodType: yup.string().required("Blood type is required"),
  volume: yup.number()
    .typeError("Volume must be a number")
    .required("Volume is required")
    .positive("Volume must be positive")
    .max(1000, "Volume cannot exceed 1000ml")
});

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SearchBox = ({ placeholder = "Search...", onSearch }) => {
  const [searchText, setSearchText] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  return (
    <Box display="flex" justifyContent="flex-end">
      <TextField
        variant="outlined"
        size="small"
        value={searchText}
        onChange={handleChange}
        placeholder={placeholder}
        sx={{
          width: '20ch',
          backgroundColor: "#fafafa",
          "&:hover": { backgroundColor: "#e0e0e0" },
          "& .MuiInputBase-input": { color: "black" },
          "& .MuiInputAdornment-root svg": { color: "black" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#9e9e9e" },
            "&:hover fieldset": { borderColor: "#bdbdbd" }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

const ShowEntriesDropdown = ({ entries, setEntries }) => (
  <Box display="flex" alignItems="center">
    <Typography sx={{ mr: 1 }}>Show</Typography>
    <FormControl size="small" sx={{ minWidth: 70 }}>
      <Select
        value={entries}
        onChange={(e) => setEntries(e.target.value)}
        variant="outlined"
        sx={{
          color: "#fff",
          backgroundColor: "#f50057",
          "& .MuiSvgIcon-root": { color: "#ccc" },
        }}
      >
        {[5, 10, 25, 50, 100].map((val) => (
          <MenuItem key={val} value={val}>{val}</MenuItem>
        ))}
      </Select>
    </FormControl>
    <Typography sx={{ ml: 1 }}>entries</Typography>
  </Box>
);

const CustomPagination = ({ page, setPage, maxPage }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <IconButton 
      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      disabled={page === 1}
    >
      <KeyboardArrowLeft />
    </IconButton>
    <Button variant="contained" size="small" sx={{ backgroundColor: "#f50057" }}>
      {page}
    </Button>
    <IconButton 
      onClick={() => setPage((prev) => Math.min(prev + 1, maxPage))}
      disabled={page === maxPage}
    >
      <KeyboardArrowRight />
    </IconButton>
  </Stack>
);

const Donations = () => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState(5);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [donations, setDonations] = useState(initialDonationData);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: null,
      donor: "",
      contact: "",
      bloodType: "",
      volume: ""
    }
  });

  const handleOpen = () => {
    setSelectedDonation(null);
    setOpen(true);
    reset();
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleViewClose = () => setViewDialogOpen(false);
  const handleEditClose = () => setEditDialogOpen(false);

  const onSubmit = (data) => {
    const formattedDate = data.date?.toLocaleDateString?.('en-GB') || data.date;
    
    if (selectedDonation) {
      // Update existing donation
      setDonations(prev => prev.map(item => 
        item.id === selectedDonation.id ? 
        { ...item, ...data, date: formattedDate } : 
        item
      ));
      setEditDialogOpen(false);
    } else {
      // Add new donation
      const newEntry = {
        ...data,
        id: Date.now(),
        volume: parseFloat(data.volume),
        date: formattedDate,
      };
      setDonations(prev => [...prev, newEntry]);
      handleClose();
    }
    reset();
  };

  const handleView = (donation) => {
    setSelectedDonation(donation);
    setViewDialogOpen(true);
  };

  const handleEdit = (donation) => {
    setSelectedDonation(donation);
    setValue("date", new Date(donation.date.split('-').reverse().join('-')));
    setValue("donor", donation.donor);
    setValue("contact", donation.contact);
    setValue("bloodType", donation.bloodType);
    setValue("volume", donation.volume);
    setEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      setDonations(prev => prev.filter(item => item.id !== id));
      // Reset to first page if current page becomes empty
      if (page > 1 && donations.length % entries === 1) {
        setPage(prev => prev - 1);
      }
    }
  };

  const filteredData = donations.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const maxPage = Math.ceil(filteredData.length / entries);
  const paginatedData = filteredData.slice((page - 1) * entries, page * entries);

  return (
    <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 5, mt: 3 }}>
        <Typography variant="h5" fontWeight="bold">Donors Donation List</Typography>
        <Button variant="contained" onClick={handleOpen} sx={{ backgroundColor: "#f50057" }}>
          + Add New
        </Button>
      </Box>

      {/* Add/Edit Donor Dialog */}
      <Dialog open={open || editDialogOpen} onClose={editDialogOpen ? handleEditClose : handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDonation ? "Edit Donation" : "Add Donation"}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Transfusion DateTime"
                  value={field.value}
                  onChange={field.onChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      error={!!errors.date}
                      helperText={errors.date?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="donor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="dense"
                  label="Donor Name"
                  error={!!errors.donor}
                  helperText={errors.donor?.message}
                />
              )}
            />

            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="dense"
                  label="Contact"
                  type="tel"
                  error={!!errors.contact}
                  helperText={errors.contact?.message}
                />
              )}
            />

            <FormControl fullWidth margin="dense">
              <Controller
                name="bloodType"
                control={control}
                render={({ field }) => (
                  <Select {...field} displayEmpty error={!!errors.bloodType}>
                    <MenuItem value=""><em>Select Blood Type</em></MenuItem>
                    {bloodTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.bloodType && (
                <Typography color="error" variant="caption">
                  {errors.bloodType.message}
                </Typography>
              )}
            </FormControl>

            <Controller
              name="volume"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="dense"
                  label="Volume (ml)"
                  type="number"
                  error={!!errors.volume}
                  helperText={errors.volume?.message}
                />
              )}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={editDialogOpen ? handleEditClose : handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} sx={{ backgroundColor: "#f50057" }}>
            {selectedDonation ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Donation Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleViewClose}>
        <DialogTitle>Donation Details</DialogTitle>
        <DialogContent>
          {selectedDonation && (
            <Box>
              <Typography><strong>Date:</strong> {selectedDonation.date}</Typography>
              <Typography><strong>Donor:</strong> {selectedDonation.donor}</Typography>
              <Typography><strong>Contact:</strong> {selectedDonation.contact}</Typography>
              <Typography><strong>Blood Type:</strong> {selectedDonation.bloodType}</Typography>
              <Typography><strong>Volume:</strong> {selectedDonation.volume}ml</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ padding: 2 }}>
        <ShowEntriesDropdown entries={entries} setEntries={setEntries} />
        <SearchBox onSearch={setSearchQuery} />
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f50057" }}>
              {["#", "Transfusion DateTime", "Donor", "Contact", "Blood Type (Volume)", "Action"].map((col, i) => (
                <TableCell key={i} align="center" sx={{ color: "white", backgroundColor: "#f50057", borderRight: "1px solid rgba(99, 97, 97, 0.2)" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((data, index) => (
              <TableRow key={data.id} sx={{ backgroundColor: "#fafafa", "&:hover": { backgroundColor: "#e0e0e0" } }}>
                <TableCell align="center" sx={{ verticalAlign: "middle", borderRight: "1px solid rgba(99, 97, 97, 0.2)" }}>
                  {(page - 1) * entries + index + 1}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle", borderRight: "1px solid rgba(99, 97, 97, 0.2)" }}>
                  {data.date}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle", borderRight: "1px solid rgba(99, 97, 97, 0.2)" }}>
                  {data.donor}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle", borderRight: "1px solid rgba(99, 97, 97, 0.2)" }}>
                  {data.contact}
                </TableCell>
                <TableCell align="center" sx={{ verticalAlign: "middle", borderRight: "1px solid rgba(99, 97, 97, 0.2)" }}>
                  {`${data.bloodType} (${data.volume}ml)`}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View">
                    <IconButton color="primary" onClick={() => handleView(data)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton color="secondary" onClick={() => handleEdit(data)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(data.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Showing {paginatedData.length > 0 ? (page - 1) * entries + 1 : 0} to{' '}
          {(page - 1) * entries + paginatedData.length} of {filteredData.length} entries
        </Typography>
        <CustomPagination page={page} setPage={setPage} maxPage={maxPage} />
      </Box>
    </Box>
  );
};

export default Donations;