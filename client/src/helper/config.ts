export const ADD_NEW_COUNTRY_URL = '/country';
export const ADD_NEW_CITY_URL = '/city';
export const ADD_NEW_GROUND_URL = '/ground';

export const GET_COUNTRIES_URL = '/countries';
export const GET_CITIES_URL = '/cities';
export const GET_GROUNDS_URL = '/grounds';

export const ITEM_HEIGHT = 72;
export const ITEM_PADDING_TOP = 8;
export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

export const currentYear = ((new Date()).getUTCFullYear()).toString();

