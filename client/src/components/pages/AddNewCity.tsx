import React, { useState, useEffect } from 'react';
import axiosConfig from '../../helper/axiosConfig';
import { useFormik } from 'formik';
import { ADD_NEW_CITY_URL, GET_COUNTRIES_URL, MenuProps } from '../../helper/config';
import { cityValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, CheckBox, InputLabel, ListItemText, MenuItem,
  FormControl,
  OutlinedInput,
  FormHelperText } from '../lib';

export const AddNewCity = () => {
  const [countryData, setCountryData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      country: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig.post(`${ADD_NEW_CITY_URL}`, {
        name: formik.values.name,
        country: formik.values.country,
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
    axiosConfig.get(`${GET_COUNTRIES_URL}`, {
    })
        .then(function(response) {
          setCountryData(response.data);
        })
        .catch(function(response) {
          console.log(response);
        });
    return () => {
      setCountryData([]);
    };
  }, []);


  return (
    <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="City"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="country-label">Country</InputLabel>
          <Select
            labelId="country-label"
            id="country"
            name="country"
            value={formik.values.country}
            onChange={formik.handleChange}
            error={formik.touched.country && Boolean(formik.errors.country)}
            input={<OutlinedInput label="Country" />}
            MenuProps={MenuProps}
          >
            {[...countryData].map((country) => (
              <MenuItem key={country._id} value={country._id}>
                <ListItemText primary={country.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.country && formik.errors.country}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </form>
  );
};
