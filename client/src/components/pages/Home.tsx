/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import { KeyboardArrowLeft, KeyboardArrowRight, FirstPage, LastPage } from '@mui/icons-material';
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow } from '../lib';
import { axiosConfig } from '../../helper';
import { GET_MATCHES_URL } from '../../helper/config';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '12px'
  },
  paper: {
    width: '90%',
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
    padding: '4px',
    border: '1px solid black',
    boxSizing: 'border-box',
    height: '40px',
    lineHeight: 'unset',
    textAlign: 'center'
  },
  header: {
    fontWeight: 700
  },
  number: {
    width: '40px'
  },
  duration: {
    width: '190px'
  },
  teams: {
    width: '200px'
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
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
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
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
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

interface HomeProps {
  handleMatchUpdateSelection:any;
}


export const Home = (props:HomeProps) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { handleMatchUpdateSelection } = props;
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [matchList, setMatchList] = useState([]);
  const limit = 20;

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
    return teams[0].team.name + ' v/s ' + teams[1].team.name;
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

  const renderInnings = (matchInnings) => {
    const group = matchInnings.reduce((acc, item) => {
      if (!acc[item.team?.name]) {
        acc[item.team?.name] = [];
      }

      acc[item.team?.name].push(item);
      return acc;
    }, {});
    const teams = Object.entries(group);
    return (teams.map((team:{}, index) => (
      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
        {team[0] + ' '}
        {
          team[1].map((e, i, arr)=> {
            return <React.Fragment key={i}>
              {e.runs}{e.wickets<10 ? '/' + e.wickets : null }{e.declared ? 'd':null}{e.allout && e.wickets<10 ?
              ' (all out)' : null} {e.follow_on ? ' (f/o)' : null}
              {i===0 && arr.length> 1 ? ' & ': null}
            </React.Fragment>;
          }
          )}
      </Box>
    )));
  };

  const Row = (props) => {
    const { row } = props;
    return (
      <React.Fragment key={row._id}>
        <TableRow
          key={row._id}
          className={classes.cell}
          onClick={() => {
            handleMatchUpdateSelection(row._id);
            navigate('/add-new-match');
          }}
          sx={{ backgroundColor: row.neutral ? '#F0E68C': 'transparent' }}
        >
          <TableCell className={`${classes.cell} ${classes.number}`}>{row.number}</TableCell>
          <TableCell className={`${classes.cell} ${classes.duration}`}>
            { renderDuration(row.start_date, row.end_date)}
          </TableCell>
          <TableCell className={`${classes.cell} ${classes.teams}`}>
            {renderTeams(row.teams)}</TableCell>
          <TableCell className={classes.cell}>
            {row.ground.name}, {row.ground.city.name}, {row.ground.city.country.name}</TableCell>
          <TableCell className={classes.cell}>{renderInnings(row.match_innings)}</TableCell>
          <TableCell className={classes.cell}>
            {renderResult(row)}</TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  Row.propTypes = {
    row: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
      start_date: PropTypes.string.isRequired,
      end_date: PropTypes.string.isRequired,
      teams: PropTypes.arrayOf(
          PropTypes.shape({
            team: PropTypes.shape({
              name: PropTypes.string.isRequired
            }),
            players: PropTypes.arrayOf(
                PropTypes.shape({
                  name: PropTypes.string.isRequired
                })
            )
          })),
      ground: PropTypes.shape({
        name: PropTypes.string.isRequired,
        city: PropTypes.shape({
          name: PropTypes.string.isRequired,
          country: PropTypes.shape({
            name: PropTypes.string.isRequired
          })
        })
      }),
      neutral: PropTypes.bool,
      innings: PropTypes.bool,
      runs: PropTypes.bool,
      wickets: PropTypes.bool,
      margin: PropTypes.number,
      winner: PropTypes.shape({
        name: PropTypes.string.isRequired
      }),
      loser: PropTypes.shape({
        name: PropTypes.string.isRequired
      }),
      match_innings: PropTypes.arrayOf(
          PropTypes.shape({
            number: PropTypes.number.isRequired,
            runs: PropTypes.number.isRequired,
            wickets: PropTypes.number.isRequired,
            allout: PropTypes.bool,
            declared: PropTypes.bool,
            follow_on: PropTypes.bool,
            team: PropTypes.shape({
              name: PropTypes.string.isRequired
            })
          }))
    }).isRequired
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
                <TableCell className={`${classes.cell} ${classes.header} ${classes.number}`}>Match #</TableCell>
                <TableCell className={`${classes.cell} ${classes.header} ${classes.duration}`}>Duration</TableCell>
                <TableCell className={`${classes.cell} ${classes.header} ${classes.teams}`} >Teams</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`} >Ground</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`} >Scores</TableCell>
                <TableCell className={`${classes.cell} ${classes.header}`}>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                matchList
                    .map((row:any) => (
                      <Row key={row._id} row={row} />
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
