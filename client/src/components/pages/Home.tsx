import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '../lib';
import { axiosConfig } from '../../helper';
import { GET_MATCHES_URL } from '../../helper/config';


const createData = (name, calories, fat) => {
  return { name, calories, fat };
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px'

  },
  paper: {
    width: '75%',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
    // marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 400
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

export const Home = () => {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [matchList, setMatchList] = useState([]);
  const [pageSize, setPageSize] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    console.log('newPage', newPage);
    setPage(newPage);
  };

  const renderDuration = (startDate, endDate) => {
    const timeFormat:Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedStartDate = (new Date(startDate)).toLocaleDateString('en-GB', timeFormat);
    const formattedEndDate = (new Date(endDate)).toLocaleDateString('en-GB', timeFormat);
    return formattedStartDate + ' - ' + formattedEndDate;
  };

  const renderTeams = (teams) => {
    return teams[0].name + ' v/s ' + teams[1].name;
  };

  const renderResult = ({ winner, loser, draw, tie, margin, innings, wickets, runs }) => {
    let result = '';
    if (draw) {
      result = 'Match Drawn';
    } else if (tie) {
      result = 'Match Tied';
    } else {
      result = winner.name + ' beat ' + loser.name;
      if (innings) {
        result += ' by an innings and ' + margin + ' run' + (margin> 1 ? 's' : '');
      } else if (runs) {
        result += ' by ' + margin + ' run' + (margin> 1 ? 's' : '');
      } else if (wickets) {
        result += ' by ' + margin + ' wicket' + (margin> 1 ? 's' : '');
      }
    }
    return result;
  };

  useEffect(() => {
    const topMovieUrl = axiosConfig.get(`${GET_MATCHES_URL}`, { params: { page, limit: rowsPerPage } });
    Promise.all([topMovieUrl]).then((responses) => {
      const { total, page, matches, pageSize } = responses[0].data;
      setMatchList(matches);
      setTotal(total);
      setPage(page);
      setCount(Math.ceil(total / rowsPerPage));
      setPageSize(pageSize);
    }).catch((errors) => {
      // react on errors.
    });
    return () => {
      setMatchList([]);
    };
  }, [page]);
  return (
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Match #</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell align="center">Teams</TableCell>
                <TableCell align="center">Ground</TableCell>
                <TableCell align="center">Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchList.map((row, index) => (
                <TableRow
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="left">{index+1}</TableCell>
                  <TableCell align="center"component="th" scope="row">
                    { renderDuration(row.start_date, row.end_date)}
                  </TableCell>
                  <TableCell align="center">{renderTeams(row.teams)}</TableCell>
                  <TableCell align="center">{row.ground.name}, {row.ground.city.name}, {row.ground.city.country.name}</TableCell>
                  <TableCell align="center" >{renderResult(row)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          showFirstButton showLastButton
          page={page}
          onPageChange={handleChangePage}
        />
      </Paper>
    </Box>

  );
};
