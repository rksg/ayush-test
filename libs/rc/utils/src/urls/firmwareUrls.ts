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
  getPreferences: {
    method: 'get',
    url: '/api/tenant/:tenantId/preferences'
  },
  updatePreferences: {
    method: 'put',
    url: '/api/tenant/:tenantId/preferences'
  }
}
