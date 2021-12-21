import React, { useState, useEffect } from 'react';
import axiosConfig from '../../helper/axiosConfig';
import { useFormik } from 'formik';
import { ADD_NEW_GROUND_URL, GET_CITIES_URL, MenuProps } from '../../helper/config';
import { groundValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, CheckBox, InputLabel, ListItemText, MenuItem,
  FormControl,
  OutlinedInput,
  FormHelperText } from '../lib';

export const AddNewGround = () => {
  const [cityData, setCityData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      city: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig.post(`${ADD_NEW_GROUND_URL}`, {
        name: formik.values.name,
        city: formik.values.city,
        grounds: []
      })
          .then(function(response) {
            resetForm();
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });
  useEffect(() => {
    axiosConfig.get(`${GET_CITIES_URL}`, {
    })
        .then(function(response) {
          setCityData(response.data);
        })
        .catch(function(response) {
          console.log(response);
        });
    return () => {
      setCityData([]);
    };
  }, []);


  return (
    <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Ground"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="city-label">City</InputLabel>
          <Select
            labelId="city-label"
            id="city"
            name="city"
            value={formik.values.city}
            onChange={formik.handleChange}
            error={formik.touched.city && Boolean(formik.errors.city)}
            input={<OutlinedInput label="City" />}
            MenuProps={MenuProps}
          >
            {[...cityData].map((city) => (
              <MenuItem key={city._id} value={city._id}>
                <ListItemText primary={city.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.city && formik.errors.city}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </form>
  );
};
