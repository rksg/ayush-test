import { ApiInfo } from '@acx-ui/utils'

const venueVersionParams = '?firmware_version=:version&firmware_type=:type&search=:search'

export const FirmwareUrlsInfo: { [key: string]: ApiInfo } = {
  getUpgradePreferences: {
    method: 'get',
    url: '/upgradeConfig/preferences',
    oldUrl: '/api/upgrade/tenant/:tenantId/preference',
    newApi: true
  },
  getSwitchUpgradePreferences: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/switchPreference'
  },
  updateUpgradePreferences: {
    method: 'put',
    url: '/upgradeConfig/preferences',
    oldUrl: '/api/upgrade/tenant/:tenantId/preference',
    newApi: true
  },
  updateSwitchUpgradePreferences: {
    method: 'put',
    url: '/api/upgrade/tenant/:tenantId/switchPreference'
  },
  getVenueVersionList: {
    method: 'get',
    url: '/venues/apFirmwares/schedules' + venueVersionParams,
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/venue' + venueVersionParams,
    newApi: true
  },
  getLatestFirmwareList: {
    method: 'get',
    url: '/apFirmwares?status=latest',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version/latest',
    newApi: true
  },
  getAvailableFirmwareList: {
    method: 'get',
    url: '/apFirmwares?status=release',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version/release',
    newApi: true
  },
  getAvailableABFList: {
    method: 'get',
    url: '/apFirmwares?status=release&abf=all',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version/release/all',
    newApi: true
  },
  getFirmwareVersionIdList: {
    method: 'get',
    url: '/apFirmwares',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/version',
    newApi: true
  },
  skipVenueUpgradeSchedules: {
    method: 'delete',
    url: '/venues/apFirmwares/schedules',
    oldUrl: '/api/tenant/:tenantId/wifi/skip/venue/schedule',
    newApi: true
  },
  updateVenueSchedules: {
    method: 'post',
    url: '/venues/apFirmwares/schedules',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/venue/schedule',
    newApi: true
  },
  updateNow: {
    method: 'PATCH',
    url: '/venues/apFirmwares',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/update-now',
    newApi: true
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
    method: 'get',
    url: '/upgradeConfig/invalidTime',
    oldUrl: '/api/upgrade/tenant/:tenantId/invalid-time',
    newApi: true
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
  },
  getLatestEdgeFirmware: {
    method: 'get',
    url: '/edgeFirmwares?latest=true',
    oldUrl: '/edgeFirmwares?latest=true',
    newApi: true
  },
  getVenueEdgeFirmwareList: {
    method: 'get',
    url: '/venues/edgeFirmwares/releases',
    oldUrl: '/venues/edgeFirmwares/releases',
    newApi: true
  },
  getAvailableEdgeFirmwareVersions: {
    method: 'get',
    url: '/edgeFirmwares',
    oldUrl: '/edgeFirmwares',
    newApi: true
  },
  updateEdgeFirmware: {
    method: 'PATCH',
    url: '/venues/edgeFirmwares/releases',
    oldUrl: '/venues/edgeFirmwares/releases',
    newApi: true
  },
  getEdgeUpgradePreferences: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/edgePreference',
    oldUrl: '/api/upgrade/tenant/:tenantId/edgePreference',
    newApi: true
  },
  updateEdgeUpgradePreferences: {
    method: 'put',
    url: '/api/upgrade/tenant/:tenantId/edgePreference',
    oldUrl: '/api/upgrade/tenant/:tenantId/edgePreference',
    newApi: true
  },
  skipEdgeUpgradeSchedules: {
    method: 'delete',
    url: '/venues/edgeFirmwares/releases',
    oldUrl: '/venues/edgeFirmwares/releases',
    newApi: true
  },
  updateEdgeVenueSchedules: {
    method: 'post',
    url: '/venues/edgeFirmwares/releases',
    oldUrl: '/venues/edgeFirmwares/releases',
    newApi: true
  }
}
