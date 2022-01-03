export const ADD_NEW_COUNTRY_URL = '/country';
export const ADD_NEW_CITY_URL = '/city';
export const ADD_NEW_GROUND_URL = '/ground';
export const ADD_NEW_TEAM_URL = '/team';
export const ADD_NEW_MATCH_URL = '/match';
export const ADD_NEW_PLAYER_URL = '/player';

export const GET_COUNTRIES_URL = '/countries';
export const GET_COUNTRY_GROUNDS_URL = '/countryGrounds';
export const GET_COUNTRY_CITIES_URL = '/countryCities';
export const GET_CITIES_URL = '/cities';
export const GET_GROUNDS_URL = '/grounds';
export const GET_TEAMS_URL = '/teams';
export const GET_TEAM_STATISTICS_URL = '/teamStatistics';
export const GET_MATCHES_URL = '/matches';
export const GET_MATCH_DETAILS_URL = '/matchDetails';

export const GET_COUNTRY_GROUNDS_COUNT_URL = '/countryGroundsCount';

export const ITEM_HEIGHT = 72;
export const ITEM_PADDING_TOP = 8;
export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300
    }
  }
};

export const currentYear = ((new Date()).getUTCFullYear()).toString();

