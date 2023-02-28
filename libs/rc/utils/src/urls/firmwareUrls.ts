import { ApiInfo } from '../apiService'

const venueVersionParams = '?firmware_version=:version&firmware_type=:type&search=:search'

export const FirmwareUrlsInfo: { [key: string]: ApiInfo } = {
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
  getPreferences: {
    method: 'get',
    url: '/api/tenant/:tenantId/preferences'
  },
  updatePreferences: {
    method: 'put',
    url: '/api/tenant/:tenantId/preferences'
  }
}
