import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import { axiosConfig } from '../../helper';
import { GET_TEAM_STATISTICS_URL } from '../../helper/config';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '../lib';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px'
  },
  paper: {
    width: '75%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '8px'
  },
  table: {
    minWidth: 400
  },
  cell: {
    border: '1px solid black',
    fontSize: 16
  },
  header: {
    fontWeight: 700
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  }
}));
export const Team = () => {
  const classes = useStyles();
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    const list = axiosConfig.get(GET_TEAM_STATISTICS_URL);
    setLoading(true);
    Promise.all([list]).then((responses) => {
      setLoading(false);
      setTeamData(responses[0].data);
    }).catch((errors) => {
      setLoading(false);
      console.log(errors);
    });
  };

  useEffect(()=> {
    fetchData();
    return () => {
      setTeamData([]);
    };
  }, []);
  return (
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className={classes.cell}>
                <TableCell className={`${classes.cell} ${classes.header}`}>Team</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Duration</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Total</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Wins</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Losses</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Draws</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Ties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamData.map((row) => (
                <TableRow
                  className={classes.cell}
                  key={row._id}
                >
                  <TableCell className={classes.cell} >
                    {row.name}
                  </TableCell>
                  <TableCell className={classes.cell} >{row.start_date} - {row.end_date}</TableCell>
                  <TableCell className={classes.cell} >{row.total}</TableCell>
                  <TableCell className={classes.cell} >{row.wins}</TableCell>
                  <TableCell className={classes.cell} >{row.losses}</TableCell>
                  <TableCell className={classes.cell} >{row.draws}</TableCell>
                  <TableCell className={classes.cell} >{row.ties}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
