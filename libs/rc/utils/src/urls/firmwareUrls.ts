import { ApiInfo } from '../apiService'

const venueVersionParams = '?firmware_version=:version&firmware_type=:type&search=:search'

export const FirmwareUrlsInfo: { [key: string]: ApiInfo } = {
  getUpgradePreferences: {
    // [New API] private api
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/preference'
  },
  updateUpgradePreferences: {
    // [New API] private api
    method: 'put',
    url: '/api/upgrade/tenant/:tenantId/preference'
  },
  getVenueVersionList: {
    // [New API] private api
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/venue' + venueVersionParams
  },
  getLatestFirmwareList: {
    // [New API] private api
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version/latest'
  },
  getAvailableFirmwareList: {
    // [New API] private api
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version/release'
  },
  getFirmwareVersionIdList: {
    // [New API] private api
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version'
  },
  skipVenueUpgradeSchedules: {
    // [New API] private api
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/skip/venue/schedule'
  },
  updateVenueSchedules: {
    // [New API] private api
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/upgrade/venue/schedule'
  },
  updateNow: {
    // [New API] no new uri yet
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/upgrade/update-now'
  },
  skipSwitchUpgradeSchedules: {
    method: 'delete',
    url: '/venues/switchFirmwares/schedules',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/skip',
    newApi: true
  },
  updateSwitchVenueSchedules: {
    method: 'post',
    url: '/venues/switchFirmwares/schedules',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/venue/schedule',
    newApi: true
  },
  getSwitchLatestFirmwareList: {
    method: 'get',
    url: '/venues/switchFirmwares/versions/latest',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/version/latest',
    newApi: true
  },
  getSwitchFirmwareVersionIdList: {
    method: 'get',
    url: '/venues/switchFirmwares/versions/all',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/version',
    newApi: true
  },
  getSwitchVenueVersionList: {
    method: 'post',
    url: '/venues/switchFirmwares/schedules/query',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/venue',
    newApi: true
  },
  getSwitchAvailableFirmwareList: {
    method: 'get',
    url: '/venues/switchFirmwares/versions/release',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/version/release',
    newApi: true
  },
  getSwitchCurrentVersions: {
    method: 'get',
    url: '/venues/switchFirmwares/currentVersions',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/venue/currentVersions',
    newApi: true
  },
  getInvalidTimeSlots: {
    // [New API] private api
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/invalid-time'
  },
  getSwitchFirmwarePredownload: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/preDownload'
  },
  updateSwitchFirmwarePredownload: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/switch/upgrade/preDownload'
  },
  getPreferences: {
    method: 'get',
    url: '/tenants/preferences',
    oldUrl: '/api/tenant/:tenantId/preferences',
    newApi: true
  },
  updatePreferences: {
    method: 'put',
    url: '/tenants/preferences',
    oldUrl: '/api/tenant/:tenantId/preferences',
    newApi: true
  }
}
