import React from 'react';
import { GET_COUNTRY_GROUNDS_COUNT_URL } from '../../helper/config';
import { getData } from '../HOC/getData';
import { ChartContainer } from '../templates';
export default getData(ChartContainer, { apiUrl: GET_COUNTRY_GROUNDS_COUNT_URL, title: 'Grounds' });
