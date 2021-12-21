import { AddNewCity, AddNewCountry, AddNewGround, Home } from '../pages';

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
  }];
