import { AddNewCity, AddNewCountry, AddNewGround, AddNewMatch, AddNewTeam, Home } from '../pages';

export const routes = [
  {
    'path': '/',
    'label': 'Home',
    'production': true,
    'component': Home
  },
  {
    'path': '/add-new-country',
    'label': 'Add New Country',
    'production': false,
    'component': AddNewCountry
  },
  {
    'path': '/add-new-city',
    'label': 'Add New City',
    'production': false,
    'component': AddNewCity
  },
  {
    'path': '/add-new-ground',
    'label': 'Add New Ground',
    'production': false,
    'component': AddNewGround
  },
  {
    'path': '/add-new-team',
    'label': 'Add New Team',
    'production': false,
    'component': AddNewTeam
  },
  {
    'path': '/add-new-match',
    'label': 'Add New Match',
    'production': false,
    'component': AddNewMatch
  }];
