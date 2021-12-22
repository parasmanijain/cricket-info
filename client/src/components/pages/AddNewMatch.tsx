/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as _ from 'lodash';
import axiosConfig from '../../helper/axiosConfig';
import {
  ADD_NEW_MATCH_URL, GET_GROUNDS_URL, GET_TEAMS_URL, MenuProps
} from '../../helper/config';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { matchValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, CheckBox, FormControl, InputLabel, MenuItem, ListItemText,
  Divider, OutlinedInput, ListSubheader, FormHelperText, Switch, FormLabel, FormControlLabel, FormGroup } from '../lib';


const initialValues = {
  start_date: new Date(),
  end_date: new Date(),
  ground: '',
  teams: [],
  winner: '',
  loser: '',
  draw: false,
  tie: false,
  innings: false,
  runs: false,
  wickets: false,
  margin: ''
};

export const AddNewMatch = () => {
  const [groundData, setGroundData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [result, setResult] = useState(false);
  const fetchData = () => {
    const grounds = axiosConfig.get(`${GET_GROUNDS_URL}`);
    const teams = axiosConfig.get(`${GET_TEAMS_URL}`);
    Promise.all([grounds, teams]).then((responses) => {
      setGroundData(responses[0].data);
      setTeamData(responses[1].data);
    }).catch((errors) => {
      console.log(errors);
    });
  };

  useEffect(() => {
    fetchData();
    return () => {
    };
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      let apiURL = '';
      let request = {};
      apiURL = ADD_NEW_MATCH_URL;
      const { start_date, end_date, ground, teams, draw, tie, winner, loser, innings, runs, wickets, margin } = formik.values;
      request = {
        start_date,
        end_date,
        ground,
        teams
      };
      if (draw) {
        request = { ...request, draw };
      } else if (tie) {
        request = { ...request, tie };
      } else {
        request = { ...request, winner, loser, margin };
        if (innings) {
          request = { ...request, innings };
        }
        if (runs) {
          request = { ...request, runs };
        }
        if (wickets) {
          request = { ...request, wickets };
        }
      }
      axiosConfig.post(apiURL, request)
          .then(function(response) {
            resetForm();
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });

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

  const makeMultiOptionItems = (data, list, key) => {
    const items = [];
    data.forEach((element, index)=> {
      if (element[list]) {
        items.push(<ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>{element.name}</ListSubheader>);
        element[list].forEach((el)=> {
          items.push(
              <MenuItem key={el._id} value={el._id}>
                <CheckBox checked={formik.values[key].indexOf(el._id) > -1} />
                <ListItemText primary={el.name} />
              </MenuItem>
          );
        });
        items.push(<Divider key={index} />);
      }
    });
    return items;
  };

  const handleChange = (event) => {
    setResult(event.target.checked);
  };
  return (
    <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <FormControl sx={{ m: 2, width: 350 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              minDate={new Date('3-15-1877')}
              value={formik.values.start_date}
              onChange={(newValue) => {
                formik.setValues({ ...formik.values, start_date: (new Date(newValue)) });
              }}
              renderInput={(params) => {
                return <TextField {...params} />;
              }
              }
            />
          </LocalizationProvider>
        </FormControl>
        <FormControl sx={{ m: 2, width: 350 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              minDate={new Date('3-15-1877')}
              value={formik.values.end_date}
              onChange={(newValue) => {
                formik.setValues({ ...formik.values, end_date: (new Date(newValue)) });
              }}
              renderInput={(params) => {
                return <TextField {...params} />;
              }
              }
            />
          </LocalizationProvider>
        </FormControl>
        <FormControl sx={{ m: 2, width: 350 }}>
          <InputLabel id="ground-label">Ground</InputLabel>
          <Select
            labelId="ground-label"
            id="ground"
            name="ground"
            value={formik.values.ground}
            onChange={formik.handleChange}
            error={formik.touched.ground && Boolean(formik.errors.ground)}
            input={<OutlinedInput label="Ground" />}
            MenuProps={MenuProps}
          >
            {makeSingleOptionItems([...groundData], 'grounds')}
          </Select>
          <FormHelperText>{formik.touched.ground && formik.errors.ground}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 2, width: 350 }}>
          <InputLabel id="teams-multiple-checkbox-label">Teams</InputLabel>
          <Select
            labelId="teams-multiple-checkbox-label"
            id="teams-multiple-checkbox"
            multiple
            name="teams"
            value={formik.values.teams}
            onChange={formik.handleChange}
            error={formik.touched.teams && Boolean(formik.errors.teams)}
            input={<OutlinedInput label="Teams" />}
            renderValue={(selected: string[]) => {
              const selectedTeams = ([...teamData].filter(
                  (team) => selected.includes(team._id))).map((element) => element.name);
              return selectedTeams.join(', ');
            }
            }
            MenuProps={MenuProps}
          >

            {[...teamData].map((team) => (
              <MenuItem key={team._id} value={team._id}>
                <CheckBox checked={formik.values.teams.indexOf(team._id) > -1} />
                <ListItemText primary={team.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.teams && formik.errors.teams}</FormHelperText>
        </FormControl>
        <FormControl component="fieldset" variant="standard" sx={{ m: 2, width: 350 }}>
          <FormLabel component="legend">Outcome</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch checked={formik.values.draw} onChange={formik.handleChange} name="draw" />
              }
              label="Draw"
            />
            <FormControlLabel
              control={
                <Switch checked={formik.values.tie} onChange={formik.handleChange} name="tie" />
              }
              label="Tie"
            />
            <FormControlLabel
              control={
                <Switch checked={result} onChange={handleChange} name="result" />
              }
              label="Result"
            />
          </FormGroup>
        </FormControl>
        <FormControl sx={{ m: 2, width: 350 }}>
          <TextField
            id="outlined-number"
            label="Margin"
            type="number"
            value={formik.values.margin}
            onChange={formik.handleChange}
            error={formik.touched.margin && Boolean(formik.errors.margin)}
            helperText={formik.touched.margin && formik.errors.margin}
            InputLabelProps={{
              shrink: true
            }}
            InputProps={{ inputProps: { min: 1, max: formik.values.wickets ? 10 : 1000 } }}
          />
        </FormControl>
        <Button color="primary" variant="contained" type="submit" sx={{ margin: 2, width: 300 }}>
          Submit
        </Button>
      </Box>
    </form>
  );
};

