/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import * as _ from 'lodash';
import enLocale from 'date-fns/locale/en-GB';
import axiosConfig from '../../helper/axiosConfig';
import {
  ADD_NEW_MATCH_URL, GET_COUNTRY_GROUNDS_URL, GET_GROUNDS_URL, GET_TEAMS_URL, MenuProps
} from '../../helper/config';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import { Delete, AddCircleOutline } from '@mui/icons-material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { matchValidationSchema as validationSchema } from '../../helper/validationScehmas';
import { Box, Button, TextField, Select, CheckBox, FormControl, InputLabel, MenuItem, ListItemText,
  Divider, OutlinedInput, ListSubheader, FormHelperText, FormLabel, FormControlLabel, Radio, RadioGroup,
  FormGroup, Switch, IconButton } from '../lib';


const initialValues = {
  start_date: new Date(),
  end_date: new Date(),
  ground: '',
  teams: [],
  winner: '',
  loser: '',
  neutral: false,
  draw: false,
  tie: false,
  innings: false,
  runs: false,
  wickets: false,
  margin: '',
  match_innings: [
    {
      runs: 0,
      wickets: 0,
      allout: false,
      declared: false,
      follow_on: false,
      team: ''
    }
  ]
};

export const AddNewMatch = () => {
  const [groundData, setGroundData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [outcomeValue, setOutcomeValue] = React.useState(null);
  const [marginValue, setMarginValue] = React.useState(null);
  const fetchData = () => {
    const grounds = axiosConfig.get(`${GET_COUNTRY_GROUNDS_URL}`);
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
      const { start_date, end_date, ground, teams, winner, margin, neutral, match_innings } = formik.values;
      request = {
        start_date,
        end_date,
        ground,
        teams
      };
      if (neutral) {
        request = { ...request, 'neutral': true };
      }
      if (['draw', 'tie'].includes(outcomeValue)) {
        request = { ...request, [outcomeValue]: true };
      } else {
        if (['innings', 'runs', 'wickets'].includes(marginValue)) {
          request = { ...request, [marginValue]: true };
        }
        const loser = teams.filter((ele)=> ele !== winner).join();
        request = { ...request, winner, loser, margin };
      }
      const innings = [];
      match_innings.forEach((inn, index)=> {
        const { runs, wickets, allout, declared, follow_on, team } = inn;
        let inning = {};
        inning = { ...inning, 'runs': runs, 'wickets': wickets, 'team': team };
        if (allout) {
          inning = { ...inning, 'allout': allout };
        } else if (declared) {
          inning = { ...inning, 'declared': declared };
        }
        if (follow_on) {
          inning = { ...inning, 'follow_on': follow_on };
        }
        inning = { ...inning, 'number': index+1 };
        innings.push(inning);
      });
      request = { ...request, 'match_innings': innings };
      axiosConfig.post(apiURL, request)
          .then(function(response) {
            resetForm();
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });

  const makeSingleOptionItems = (data, key1, key2) => {
    const items = [];
    data.forEach((element, index)=> {
      const firstLevel = element[key1];
      if (firstLevel) {
        items.push(<ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>{element.name}</ListSubheader>);
        firstLevel.forEach((el1)=> {
          const secondLevel = el1[key2];
          secondLevel.forEach((el2)=> {
            items.push(
                <MenuItem key={el2._id} value={el2._id}>
                  {el2.name}, {el1.name}
                </MenuItem>
            );
          });
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
    <FormikProvider value={formik}>
      <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <FormControl sx={{ m: 2, width: 350 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
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
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
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
          <FormControl sx={{ m: 2, width: 570 }}>
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
              {makeSingleOptionItems([...groundData], 'cities', 'grounds')}
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
          <FormControl component="fieldset" sx={{ m: 2, width: 350 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch checked={formik.values.neutral} onChange={formik.handleChange} name="neutral" />
                }
                label="Neutral"
              />
            </FormGroup>
          </FormControl>
          { formik.values.teams.length === 2 ?
        <React.Fragment>
          <FormControl component="fieldset" sx={{ m: 2, width: '100%' }}>
            <FieldArray
              name="match_innings"
              render={(arrayHelpers) => (
                <div>
                  {
                    formik.values.match_innings.map((inning, index) => {
                      return (
                        <FormGroup key={index} sx= {{ display: 'flex', flexDirection: 'row' }}>
                          <FormControl sx={{ m: 1, minWidth: 200 }}>
                            <InputLabel id="team-label">Team</InputLabel>
                            <Select
                              id="team"
                              labelId="team-label"
                              name={`match_innings[${index}].team`}
                              value={formik.values.match_innings[index].team}
                              onChange={formik.handleChange}
                              error={formik.touched.match_innings && Boolean(formik.errors.match_innings)}
                              input={<OutlinedInput label="Team" />}
                              MenuProps={MenuProps}
                            >
                              {[...teamData].filter((el)=> formik.values.teams.includes(el._id)).map((country) => (
                                <MenuItem key={country._id} value={country._id}>
                                  <ListItemText primary={country.name} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <TextField
                              id="runs"
                              label= 'Runs'
                              type="number"
                              name={`match_innings[${index}].runs`}
                              value={formik.values.match_innings[index].runs}
                              onChange={formik.handleChange}
                              error={formik.touched.match_innings && Boolean(formik.errors.match_innings)}
                              helperText={formik.touched.match_innings && formik.errors.match_innings}
                              InputProps={{ inputProps: { min: 0, max: 9999 } }}
                            />
                          </FormControl>
                          <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <TextField
                              id="wickets"
                              label= 'Wickets'
                              type="number"
                              name={`match_innings[${index}].wickets`}
                              value={formik.values.match_innings[index].wickets}
                              onChange={formik.handleChange}
                              error={formik.touched.match_innings && Boolean(formik.errors.match_innings)}
                              helperText={formik.touched.match_innings &&
                               (formik.errors.match_innings)}
                              InputProps={{ inputProps: { min: 0, max: 10 } }}
                            />
                          </FormControl>
                          {
                          formik.values.match_innings[index].wickets !== 10 ?
                          <FormControlLabel
                            control={
                              <Switch
                                name={`match_innings[${index}].allout`}
                                checked={formik.values.match_innings[index].allout} onChange={formik.handleChange}/>
                            }
                            label="Allout"
                          /> : null
                          }
                          { index !==3 && formik.values.match_innings[index].wickets !== 10 ?
                          <FormControlLabel
                            control={
                              <Switch
                                name={`match_innings[${index}].declared`}
                                checked={formik.values.match_innings[index].declared} onChange={formik.handleChange}/>
                            }
                            label="Declared"
                          />: null}
                          { index === 2 ? <FormControlLabel
                            control={
                              <Switch
                                name={`match_innings[${index}].follow_on`}
                                checked={formik.values.match_innings[index].follow_on} onChange={formik.handleChange}/>
                            }
                            label="Follow On"
                          /> : null}
                          <IconButton onClick={() => arrayHelpers.remove(index)} aria-label="delete"
                            disabled= {formik.values.match_innings.length === 1}>
                            <Delete />
                          </IconButton>
                        </FormGroup>
                      );
                    })
                  }
                  <IconButton
                    onClick={() => arrayHelpers.push({ allout: false, declared: false, follow_on: false, runs: 0, wickets: 0, team: '' })}
                    aria-label="delete"
                    disabled= {formik.values.match_innings.length === 4}>
                    <AddCircleOutline />
                  </IconButton>
                </div>
              )}
            />


          </FormControl>
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
            <FormHelperText>{formik.touched.winner && formik.errors.winner}</FormHelperText>
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
    </FormikProvider>
  );
};

