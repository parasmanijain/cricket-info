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
