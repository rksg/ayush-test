import { ApiInfo } from '@acx-ui/utils'

const venueVersionParams = '?firmware_version=:version&firmware_type=:type&search=:search'

export const FirmwareUrlsInfo: { [key: string]: ApiInfo } = {
  getUpgradePreferences: {
    method: 'get',
    url: '/upgradeConfig/preferences',
    oldUrl: '/api/upgrade/tenant/:tenantId/preference',
    newApi: true,
    opsApi: 'GET:/upgradeConfig/preferences'
  },
  getSwitchUpgradePreferences: {
    method: 'get',
    url: '/upgradeConfig/switchPreference',
    newApi: true
  },
  updateUpgradePreferences: {
    method: 'put',
    url: '/upgradeConfig/preferences',
    oldUrl: '/api/upgrade/tenant/:tenantId/preference',
    newApi: true,
    opsApi: 'PUT:/upgradeConfig/preferences'
  },
  updateSwitchUpgradePreferences: {
    method: 'put',
    url: '/upgradeConfig/switchPreference',
    newApi: true,
    opsApi: 'PUT:/upgradeConfig/switchPreference'
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
  getApModelFamilies: {
    method: 'post',
    url: '/apModelFamilies/query',
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
  updateDowngrade: {
    method: 'put',
    url: '/venues/:venueId/apFirmwares/:firmwareVersion',
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
  getSwitchDefaultFirmwareList: {
    method: 'get',
    url: '/venues/switchFirmwares/versions/default',
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
  getSwitchFirmwareList: {
    method: 'post',
    url: '/venues/switchFirmwares/switches/schedules/query',
    newApi: true
  },
  getSwitchFirmwareStatusList: {
    method: 'post',
    url: '/venues/switchFirmwares/upgradeStatusDetails/query',
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
    method: 'post',
    url: '/edgeFirmwares/schedules/query',
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
    url: '/venues/:venueId/edgeFirmwares',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeFirmwares'
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
    newApi: true,
    opsApi: 'PUT:/api/upgrade/tenant/{id}/edgePreference'
  },
  skipEdgeUpgradeSchedules: {
    method: 'delete',
    url: '/venues/:venueId/edgeFirmwares/schedules',
    newApi: true,
    opsApi: 'DELETE:/venues/{id}/edgeFirmwares/schedules'
  },
  updateEdgeVenueSchedules: {
    method: 'post',
    url: '/venues/:venueId/edgeFirmwares/schedules',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeFirmwares/schedules'
  },
  getScheduledFirmware: {
    method: 'get',
    url: '/apFirmwares?status=scheduled',
    oldUrl: '/api/tenant/:tenantId/wifi/upgrade/schedule-version',
    newApi: true
  },
  getVenueApModelFirmwareList: {
    method: 'post',
    url: '/venues/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueApModelFirmwareSchedulesList: {
    method: 'post',
    url: '/venues/apModelFirmwares/schedules/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getAllApModelFirmwareList: {
    method: 'get',
    url: '/apModelFirmwares',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  patchVenueApModelFirmwares: {
    method: 'put',
    url: '/apModelFirmwares/batchOperations/:batchId/venues/:venueId',
    opsApi: 'PUT:/apModelFirmwares/batchOperations/{id}/venues/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueApModelFirmwares: {
    method: 'get',
    url: '/venues/:venueId/apModelFirmwares',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueSchedulesPerApModel: {
    method: 'put',
    url: '/apModelFirmwares/batchOperations/:batchId/venues/:venueId',
    opsApi: 'PUT:/apModelFirmwares/batchOperations/{id}/venues/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  skipVenueSchedulesPerApModel: {
    method: 'delete',
    url: '/apModelFirmwares/batchOperations/:batchId/venues/:venueId',
    opsApi: 'DELETE:/apModelFirmwares/batchOperations/{id}/venues/{id}',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getDistinctFirmwareIdList: {
    method: 'get',
    url: '/apModelFirmwares?status=distinctFirmwareVersion',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  startFirmwareBatchOperation: {
    method: 'post',
    url: '/apModelFirmwares/batchOperations',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  startEdgeFirmwareBatchOperation: {
    method: 'post',
    url: '/edgeFirmwares/batchOperations',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  startEdgeFirmwareVenueUpdateNow: {
    method: 'PATCH',
    url: '/edgeFirmwares/batchOperations/:batchId/venues/:venueId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PATCH:/edgeFirmwares/batchOperations/{id}/venues/{id}'
  },
  updateEdgeFirmwareVenueSchedule: {
    method: 'post',
    url: '/edgeFirmwares/batchOperations/:batchId/venues/:venueId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/edgeFirmwares/batchOperations/{id}/venues/{id}'
  },
  skipEdgeFirmwareVenueSchedule: {
    method: 'delete',
    url: '/edgeFirmwares/batchOperations/:batchId/venues/:venueId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/edgeFirmwares/batchOperations/{id}/venues/{id}'
  }
}
