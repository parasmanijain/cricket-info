import * as yup from 'yup';

// eslint-disable-next-line max-len
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

export const countryValidationSchema = yup.object({
  name: yup
      .string()
      .required('Country is required')
});

export const cityValidationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  country: yup
      .string()
      .required('Country is required')
});

export const groundValidationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  city: yup
      .string()
      .required('City is required')
});

export const teamValidationSchema = yup.object({
  name: yup
      .string()
      .required('Team is required')
});

export const playerValidationSchema = yup.object({
  name: yup
      .string()
      .required('Team is required'),
  team: yup
      .array()
      .required('Team is required')
});

export const matchValidationSchema = yup.object({
  start_date: yup
      .date()
      .required('Start Date is required'),
  end_date: yup
      .date()
      .required('End Date is required'),
  ground: yup
      .string()
      .required('Ground is required'),
  teams: yup
      .array()
      .required('Teams are required'),
  winner: yup
      .string(),
  loser: yup
      .string(),
  draw: yup
      .boolean(),
  tie: yup
      .boolean(),
  innings: yup
      .boolean(),
  runs: yup
      .boolean(),
  wickets: yup
      .boolean(),
  margin: yup
      .string()

});
