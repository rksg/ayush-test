import { defineMessage } from 'react-intl'


export enum VideoCallQoEErrorsType {
  ZOOM_CALL_TEST_NAME_NOT_UNIQUE = 'ZOOM_CALL_TEST_NAME_NOT_UNIQUE'
}

export const videoCallQoEErrorMessage: { [key: string]: { defaultMessage: string } } = {
  [VideoCallQoEErrorsType.ZOOM_CALL_TEST_NAME_NOT_UNIQUE]: defineMessage({
    defaultMessage: 'Test name exists. Enter a different name.'
  })
}

export const ERROR_MESSAGE_MAPPING: { [key: string]: { defaultMessage: string } } = {

  // Call Manager API Related
  ZOOM_CALL_TEST_NAME_NOT_UNIQUE: defineMessage({
    defaultMessage: 'Test name exists. Enter a different name'
  })
  //  ZOOM_CALL_TEST_NAME_NOT_UNIQUE: $t({
  //    defaultMessage: 'Test name exists. Enter a different name' }),
  // ZOOM_CALL_NO_PARTICIPANT_ON_WIFI: $t({
  //   defaultMessage: 'Call participants are not connected on RUCKUS WiFi' }),
  // ZOOM_CALL_PARTICIPANT_COUNT_NOT_2: $t({
  //   defaultMessage: 'Invalid number of participants. Only 2 are allowed'
  // }),
  // TENANT_ACCOUNT_ID_INVALID: $t({ defaultMessage: 'Tenant account ID is invalid' }),
  // ZOOM_CALL_RATE_EXCEEDED_ACCOUNT: $t({
  //   defaultMessage: 'Daily test limit reached, try again later'
  // }),
  // ZOOM_CALL_IN_PROGRESS: $t({ defaultMessage: 'Only one active call is allowed' }),
  // ZOOM_ACCOUNT_UNAVAILABLE: $t({ defaultMessage: 'Zoom account is unavailable. Try again later' }),
  // TEST_CREATE_ERROR: $t({ defaultMessage: 'Unable to create test currently, try again later' }),
  // TEST_DELETE_ERROR: $t({ defaultMessage: 'Unable to delete test call. Try again later' }),
  // ZOOM_CALL_PARTICIPANT_QOS_EMPTY: $t({
  //   defaultMessage: 'Zoom returned Null data for call participants'
  // }),
  //SYSTEM_ERROR: 'System Error'
}
