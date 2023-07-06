import { defineMessage } from 'react-intl'

export const messageMapping = {
  DUPLICATE_NAME_NOT_ALLOWED: defineMessage({ defaultMessage: 'Duplicate test name exist' }),
  // Call Manager API Related
  ZOOM_CALL_TEST_NAME_NOT_UNIQUE: defineMessage({
    defaultMessage: 'Test name exists. Enter a different name'
  }),
  ZOOM_CALL_NO_PARTICIPANT_ON_WIFI: defineMessage({
    defaultMessage: 'Call participants are not connected on RUCKUS WiFi'
  }),
  ZOOM_CALL_PARTICIPANT_COUNT_NOT_2: defineMessage({
    defaultMessage: 'Invalid number of participants. Only 2 are allowed'
  }),
  TENANT_ACCOUNT_ID_INVALID: defineMessage({ defaultMessage: 'Tenant account ID is invalid' }),
  ZOOM_CALL_RATE_EXCEEDED_ACCOUNT: defineMessage({
    defaultMessage: 'Daily test limit reached, try again later'
  }),
  ZOOM_CALL_IN_PROGRESS: defineMessage({ defaultMessage: 'Only one active call is allowed' }),
  ZOOM_ACCOUNT_UNAVAILABLE: defineMessage({
    defaultMessage: 'Zoom account is unavailable. Try again later'
  }),
  TEST_CREATE_ERROR: defineMessage({
    defaultMessage: 'Unable to create test currently, try again later'
  }),
  TEST_DELETE_SUCCESS: defineMessage({
    defaultMessage: 'Test call deleted successfully'
  }),
  TEST_DELETE_ERROR: defineMessage({
    defaultMessage: 'Unable to delete test call. Try again later'
  }),
  ZOOM_CALL_PARTICIPANT_QOS_EMPTY: defineMessage({
    defaultMessage: 'Zoom returned Null data for call participants'
  }),
  SYSTEM_ERROR: defineMessage({ defaultMessage: 'System Error' })
}