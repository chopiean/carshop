import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Addcar from "./Addcar";
import Editcar from "./Editcar";

export default function Carlist() {
  const [cars, setCars] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let url = "https://car-rest-service-carshop.2.rahtiapp.fi/cars";
    let allCars = [];

    try {
      while (url) {
        const response = await fetch(url);
        const data = await response.json();

        if (data._embedded?.cars) {
          allCars = allCars.concat(data._embedded.cars);
        }

        url = data._links?.next?.href || null;
      }

      setCars(allCars);
      console.log("Total cars loaded:", allCars.length);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const deleteCar = (link) => {
    if (window.confirm("Are you sure to delete this car?")) {
      fetch(link, { method: "DELETE" })
        .then((res) => {
          if (res.ok) {
            setMessage("Car deleted successfully!");
            setOpen(true);
            fetchData();
          } else {
            setMessage("Failed to delete car.");
            setOpen(true);
          }
        })
        .catch(() => {
          setMessage("Error deleting car.");
          setOpen(true);
        });
    }
  };

  const handleClose = () => setOpen(false);

  const saveCar = (car) => {
    fetch("https://car-rest-service-carshop.2.rahtiapp.fi/cars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(car),
    })
      .then((res) => fetchData())
      .catch((err) => console.error(err));
  };
  const updateCar = (car, link) => {
    fetch(link, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(car),
    })
      .then((res) => {
        if (res.ok) {
          setMessage("Car updated successfully");
          setOpen(true);
          fetchData();
        } else {
          setMessage("Failed to update car.");
          setOpen(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error updating car.");
        setOpen(true);
      });
  };

  const columns = [
    { Header: "Brand", accessor: "brand" },
    { Header: "Model", accessor: "model" },
    { Header: "Color", accessor: "color" },
    { Header: "Fuel", accessor: "fuel" },
    { Header: "Model Year", accessor: "modelYear" },
    { Header: "Price", accessor: "price" },
    {
      sortable: false,
      filterable: false,
      width: 100,
      Cell: (row) => <Editcar updateCar={updateCar} car={row.original} />,
    },
    {
      Header: "Action",
      accessor: "_links.self.href",
      sortable: false,
      filterable: false,
      width: 100,
      Cell: ({ value }) => (
        <Button
          color="error"
          size="small"
          variant="contained"
          onClick={() => deleteCar(value)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 60, padding: 20 }}>
      <Addcar saveCar={saveCar}></Addcar>
      <ReactTable
        data={cars}
        columns={columns}
        filterable
        defaultPageSize={10}
        className="-striped -highlight"
        style={{ width: "100%", overflowX: "auto" }}
      />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={message}
      />
    </div>
  );
}
