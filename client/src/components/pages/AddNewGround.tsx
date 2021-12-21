import React, { useState, useEffect } from 'react';
import axiosConfig from '../../helper/axiosConfig';
import { useFormik } from 'formik';
import { ADD_NEW_GROUND_URL, GET_COUNTRIES_URL, MenuProps } from '../../helper/config';
import { groundValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, InputLabel, ListItemText, MenuItem,
  FormControl,
  OutlinedInput,
  FormHelperText,
  ListSubheader,
  Divider } from '../lib';

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
    axiosConfig.get(`${GET_COUNTRIES_URL}`, {
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

  const makeSingleOptionItems = (data, key) => {
    const items = [];
    data.forEach((element, index)=> {
      if (element[key]) {
        items.push(<ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>{element.name}</ListSubheader>);
        element[key].forEach((el)=> {
          items.push(
              <MenuItem key={el._id} value={el._id}>
                {el.name}
              </MenuItem>
          );
        });
        items.push(<Divider key={index} />);
      } else {
        items.push(
            <MenuItem key={element._id + index} value={element._id}>
              {element.name}
            </MenuItem>
        );
      }
    });
    return items;
  };


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
            {makeSingleOptionItems([...cityData], 'cities')}
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
