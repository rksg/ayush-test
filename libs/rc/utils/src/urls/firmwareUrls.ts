import { ApiInfo } from '../apiService'

const venueVersionParams = '?firmware_version=:version&firmware_type=:type&search=:search'

export const FirmwareUrlsInfo: { [key: string]: ApiInfo } = {
  getUpgradePreferences: {
    // [New API] new uri not ready
    method: 'get',
    url: '/upgradeConfig/preferences',
    oldUrl: '/api/upgrade/tenant/:tenantId/preference',
    newApi: false
  },
  getSwitchUpgradePreferences: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/switchPreference'
  },
  updateUpgradePreferences: {
    // [New API] new uri not ready
    method: 'put',
    url: '/upgradeConfig/preferences',
    oldUrl: '/api/upgrade/tenant/:tenantId/preference',
    newApi: false
  },
  updateSwitchUpgradePreferences: {
    method: 'put',
    url: '/api/upgrade/tenant/:tenantId/switchPreference'
  },
  getVenueVersionList: {
    // [New API] new uri not ready
    // method: 'get',
    // url: '/venues/apFirmwares/schedules' + venueVersionParams,
    // oldUrl: '/api/tenant/:tenantId/wifi/upgrade/venue' + venueVersionParams,
    // newApi: false
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/venue' + venueVersionParams
  },
  getLatestFirmwareList: {
    // [New API] new uri not ready
    method: 'get',
    url: '/apFirmwares',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version/latest',
    newApi: false
  },
  getAvailableFirmwareList: {
    // [New API] new uri not ready
    // method: 'get',
    // url: '/apFirmwares',
    // oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version/release',
    // newApi: false
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/version/release'
  },
  getFirmwareVersionIdList: {
    // [New API] new uri not ready
    method: 'get',
    url: '/apFirmwares',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version',
    newApi: false
  },
  skipVenueUpgradeSchedules: {
    // [New API] new uri not ready
    method: 'delete',
    url: '/venues/apFirmwares/schedules',
    oldUrl: '/api/tenant/:tenantId/wifi/skip/venue/schedule',
    newApi: false
  },
  updateVenueSchedules: {
    // [New API] new uri not ready
    method: 'post',
    url: '/venues/apFirmwares/schedules',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/venue/schedule',
    newApi: false
  },
  updateNow: {
    // [New API] new uri not ready
    method: 'PATCH',
    url: '/venues/apFirmwares',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/update-now',
    newApi: false
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
    // [New API] new uri not ready
    method: 'get',
    url: '/upgradeConfig/invalidTime',
    oldUrl: '/api/upgrade/tenant/:tenantId/invalid-time',
    newApi: false
  },
  getSwitchFirmwarePredownload: {
    method: 'get',
    url: '/switchFirmwares/preDownload',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/preDownload',
    newApi: true
  },
  updateSwitchFirmwarePredownload: {
    method: 'put',
    url: '/switchFirmwares/preDownload',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/preDownload',
    newApi: true
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
