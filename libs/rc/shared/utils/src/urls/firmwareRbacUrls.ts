import { ApiInfo } from '@acx-ui/utils'

import { FirmwareUrlsInfo } from './firmwareUrls'

export const FirmwareRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...FirmwareUrlsInfo,
  skipSwitchUpgradeSchedules: {
    method: 'delete',
    url: '/venues/:venueId/switchFirmwares/schedules',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/skip',
    newApi: true
  },
  updateSwitchVenueSchedules: {
    method: 'post',
    url: '/venues/:venueId/switchFirmwares/schedules',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/venue/schedule',
    newApi: true
  },
  getSwitchLatestFirmwareList: {
    method: 'get',
    url: '/switchFirmwares/versions/latest',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/version/latest',
    newApi: true
  },
  getSwitchDefaultFirmwareList: {
    method: 'get',
    url: '/switchFirmwares/versions/default',
    newApi: true
  },
  getSwitchFirmwareVersionIdList: {
    method: 'get',
    url: '/switchFirmwares/versions/all',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/version',
    newApi: true
  },
  getSwitchVenueVersionList: {
    method: 'post',
    url: '/switchFirmwares/schedules/query',
    newApi: true
  },
  getSwitchAvailableFirmwareList: {
    method: 'get',
    url: '/switchFirmwares/versions/release',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/version/release',
    newApi: true
  },
  getSwitchCurrentVersions: {
    method: 'get',
    url: '/switchFirmwares/currentVersions',
    newApi: true
  },
  getSwitchFirmwareList: {
    method: 'post',
    url: '/venues/:venueId/switchFirmwares/schedules/query',
    newApi: true
  },
  getSwitchFirmwareStatusList: {
    method: 'get',
    url: '/venues/:venueId/switchFirmwares/upgradeStatusDetails/query',
    newApi: true
  }
}
