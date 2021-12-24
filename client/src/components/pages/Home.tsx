import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '../lib';
import { axiosConfig } from '../../helper';
import { GET_MATCHES_URL } from '../../helper/config';
import { IconButton } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '4px'

  },
  paper: {
    width: '75%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0px'
  },
  table: {
    minWidth: 400
  },
  cell: {
    height: '12px',
    padding: '4px',
    border: '1px solid black'
  },
  header: {
    fontWeight: 700
  },
  pagination: {
    minHeight: '24px', padding: '4px', border: '1px solid black', borderTop: 'none', boxSizing: 'border-box',
    display: 'flex', justifyContent: 'center', width: '100%'
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

const TablePaginationActions = (props) => {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, minHeight: '24px' }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
};

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};


export const Home = () => {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [matchList, setMatchList] = useState([]);
  const limit = 30;

  const handleChangePage = (event, newPage) => {
    setPage(newPage+1);
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

  const fetchData = () => {
    const topMovieUrl = axiosConfig.get(`${GET_MATCHES_URL}`, { params: { page: page, limit } });
    Promise.all([topMovieUrl]).then((responses) => {
      const { total, page, matches, pageSize } = responses[0].data;
      setMatchList(matches);
      setTotal(total);
      setPage(page);
      setCount(Math.ceil(total / pageSize));
    }).catch((errors) => {
      // react on errors.
    });
  };

  useEffect(() => {
    fetchData();
    return () => {
    };
  }, [page]);
  return (
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className={classes.cell}>
                <TableCell className={`${classes.cell} ${classes.header}`} align="left">Match #</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`} align="center">Duration</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`} align="center">Teams</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`} align="center">Ground</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`} align="center">Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                matchList
                    .map((row, index) => (
                      <TableRow
                        key={row._id}
                        className={classes.cell}
                        sx={{ backgroundColor: row.neutral ? '#F0E68C': 'transparent' }}
                      >
                        <TableCell className={classes.cell} align="left">{row.number}</TableCell>
                        <TableCell className={classes.cell} align="center"component="th" scope="row">
                          { renderDuration(row.start_date, row.end_date)}
                        </TableCell>
                        <TableCell className={classes.cell} align="center">
                          {renderTeams(row.teams)}</TableCell>
                        <TableCell className={classes.cell} align="center">
                          {row.ground.name}, {row.ground.city.name}, {row.ground.city.country.name}</TableCell>
                        <TableCell className={classes.cell} align="center" >
                          {renderResult(row)}</TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className={classes.pagination}
          rowsPerPageOptions={[]}
          component="div"
          count={total}
          rowsPerPage={limit}
          page={page-1}
          onPageChange={handleChangePage}
          ActionsComponent={TablePaginationActions}
        />
      </Paper>
    </Box>

  );
};
