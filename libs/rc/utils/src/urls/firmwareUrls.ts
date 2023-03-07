import { ApiInfo } from '../apiService'

const venueVersionParams = '?firmware_version=:version&firmware_type=:type&search=:search'

export const FirmwareUrlsInfo: { [key: string]: ApiInfo } = {
  getUpgradePreferences: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/preference'
  },
  updateUpgradePreferences: {
    method: 'put',
    url: '/api/upgrade/tenant/:tenantId/preference'
  },
  getVenueVersionList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/venue' + venueVersionParams
  },
  getLatestFirmwareList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version/latest'
  },
  getAvailableFirmwareList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version/release'
  },
  getFirmwareVersionIdList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version'
  },
  skipVenueUpgradeSchedules: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/skip/venue/schedule'
  },
  updateVenueSchedules: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/upgrade/venue/schedule'
  },
  updateNow: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/upgrade/update-now'
  },
  skipSwitchUpgradeSchedules: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/skip'
  },
  updateSwitchVenueSchedules: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/venue/schedule'
  },
  getSwitchLatestFirmwareList: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/version/latest'
  },
  getSwitchFirmwareVersionIdList: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/version'
  },
  getSwitchVenueVersionList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/venue'
  },
  getSwitchAvailableFirmwareList: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/version/release'
  },
  getSwitchCurrentVersions: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/venue/currentVersions'
  },
  getInvalidTimeSlots: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/invalid-time'
  },
  getPreferences: {
    method: 'get',
    url: '/api/tenant/:tenantId/preferences'
  },
  updatePreferences: {
    method: 'put',
    url: '/api/tenant/:tenantId/preferences'
  }
}
