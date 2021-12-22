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
  Divider, OutlinedInput, ListSubheader, FormHelperText, FormLabel, FormControlLabel, Radio, RadioGroup } from '../lib';


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
  const [outcomeValue, setOutcomeValue] = React.useState(null);
  const [marginValue, setMarginValue] = React.useState(null);
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
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      let apiURL = '';
      let request = {};
      apiURL = ADD_NEW_MATCH_URL;
      const { start_date, end_date, ground, teams, winner, margin } = formik.values;
      request = {
        start_date,
        end_date,
        ground,
        teams
      };
      if (['draw', 'tie'].includes(outcomeValue)) {
        request = { ...request, [outcomeValue]: true };
      } else {
        if (['innings', 'runs', 'wickets'].includes(marginValue)) {
          request = { ...request, [marginValue]: true };
        }
        const loser = teams.filter((ele)=> ele !== winner).join();
        request = { ...request, winner, loser, margin };
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

  const handleOutcomeChange = (event) => {
    setOutcomeValue(event.target.value);
  };

  const handleMarginChange = (event) => {
    const { value } = event.target;
    setMarginValue(value);
    formik.setFieldValue('margin', 1);
  };

  const calcEndDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  return (
    <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <FormControl sx={{ m: 2, width: 350 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              minDate={new Date('3-15-1877')}
              maxDate={ new Date()}
              value={formik.values.start_date}
              onChange={(newValue) => {
                formik.setValues({ ...formik.values, start_date: (new Date(new Date(newValue).setUTCHours(0, 0, 0))) });
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
              minDate={new Date(formik.values.start_date)}
              maxDate={calcEndDate(formik.values.start_date, 15) }
              value={formik.values.end_date}
              onChange={(newValue) => {
                formik.setValues({ ...formik.values, end_date: (new Date(new Date(newValue).setUTCHours(0, 0, 0))) });
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
        { formik.values.teams.length === 2 ?
        <React.Fragment>
          <FormControl component="fieldset" sx={{ m: 2, width: 350 }}>
            <FormLabel component="legend">Outcome</FormLabel>
            <RadioGroup
              aria-label="outcome"
              name="outcome-radio-buttons-group"
              value={outcomeValue}
              onChange={handleOutcomeChange}
            >
              <FormControlLabel value="draw" control={<Radio />} label="Draw" />
              <FormControlLabel value="tie" control={<Radio />} label="Tie" />
              <FormControlLabel value="result" control={<Radio />} label="Result" />
            </RadioGroup>
          </FormControl>
          { outcomeValue === 'result' ?
        <React.Fragment>
          <FormControl sx={{ m: 2, width: 350 }}>
            <InputLabel id="winner-label">Winner</InputLabel>
            <Select
              labelId="winner-label"
              id="winner"
              name="winner"
              value={formik.values.winner}
              onChange={formik.handleChange}
              error={formik.touched.winner && Boolean(formik.errors.winner)}
              input={<OutlinedInput label="Winner" />}
              MenuProps={MenuProps}
            >
              {[...teamData].filter((el)=> formik.values.teams.includes(el._id)).map((country) => (
                <MenuItem key={country._id} value={country._id}>
                  <ListItemText primary={country.name} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formik.touched.ground && formik.errors.ground}</FormHelperText>
          </FormControl>
          <FormControl component="fieldset" sx={{ m: 2, width: 350 }}>
            <FormLabel component="legend">Margin</FormLabel>
            <RadioGroup
              aria-label="margin"
              name="margin-radio-buttons-group"
              value={marginValue}
              onChange={handleMarginChange}
            >
              <FormControlLabel value="innings" control={<Radio />} label="Innings" />
              <FormControlLabel value="runs" control={<Radio />} label="Runs" />
              <FormControlLabel value="wickets" control={<Radio />} label="Wickets" />
            </RadioGroup>
          </FormControl>
          { marginValue ? <FormControl sx={{ m: 2, width: 350 }}>
            <TextField
              id="margin"
              label= {marginValue === 'wickets' ? 'Wicket(s)' : 'Run(s)'}
              type="number"
              value={formik.values.margin}
              onChange={formik.handleChange}
              error={formik.touched.margin && Boolean(formik.errors.margin)}
              helperText={formik.touched.margin && formik.errors.margin}
              InputProps={{ inputProps: { min: 1, max: marginValue === 'wickets' ? 10 : 1000 } }}
            />
          </FormControl>: null}

        </React.Fragment> :

       null}
        </React.Fragment> :
        null}
        <Button color="primary" variant="contained" type="submit" sx={{ margin: 2, width: 300 }}>
          Submit
        </Button>
      </Box>
    </form>
  );
};
