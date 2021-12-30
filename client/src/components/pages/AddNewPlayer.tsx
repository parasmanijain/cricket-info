import React, { useState, useEffect } from 'react';
import axiosConfig from '../../helper/axiosConfig';
import { useFormik } from 'formik';
import { ADD_NEW_PLAYER_URL, GET_TEAMS_URL, MenuProps } from '../../helper/config';
import { playerValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, CheckBox, InputLabel, ListItemText, MenuItem,
  FormControl,
  OutlinedInput,
  FormHelperText } from '../lib';

export const AddNewPlayer = () => {
  const [teamData, setTeamData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      team: []
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig.post(`${ADD_NEW_PLAYER_URL}`, {
        name: formik.values.name,
        team: formik.values.team
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
    axiosConfig.get(`${GET_TEAMS_URL}`, {
    })
        .then(function(response) {
          setTeamData(response.data);
        })
        .catch(function(response) {
          console.log(response);
        });
    return () => {
      setTeamData([]);
    };
  }, []);


  return (
    <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Player"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Team</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            name="team"
            value={formik.values.team}
            onChange={formik.handleChange}
            error={formik.touched.team && Boolean(formik.errors.team)}

            input={<OutlinedInput label="Team" />}
            renderValue={(selected:string[]) => {
              const selectedTeams = (teamData.filter((team)=> selected.includes(team._id))).map((element)=> element.name);
              return selectedTeams.join(', ');
            }
            }
            MenuProps={MenuProps}
          >

            {teamData.map((team) => (
              <MenuItem key={team._id} value={team._id}>
                <CheckBox checked={formik.values.team.indexOf(team._id) > -1} />
                <ListItemText primary={team.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.team && formik.errors.team}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </form>
  );
};
