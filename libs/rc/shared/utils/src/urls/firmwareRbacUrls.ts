import { ApiInfo } from '@acx-ui/utils'

import { FirmwareUrlsInfo } from './firmwareUrls'

export const FirmwareRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...FirmwareUrlsInfo,
  skipSwitchUpgradeSchedules: {
    method: 'delete',
    url: '/venues/:venueId/switchFirmwares/schedules',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/skip',
    opsApi: 'DELETE:/venues/{id}/switchFirmwares/schedules',
    newApi: true
  },
  updateSwitchVenueSchedules: {
    method: 'post',
    url: '/venues/:venueId/switchFirmwares/schedules',
    oldUrl: '/api/switch/tenant/:tenantId/switch/upgrade/venue/schedule',
    opsApi: 'POST:/venues/{id}/switchFirmwares/schedules',
    newApi: true
  },
  getSwitchLatestFirmwareList: {
    method: 'get',
    url: '/switchFirmwares/versions/latest',
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
    newApi: true
  },
  getSwitchCurrentVersions: {
    method: 'get',
    url: '/switchFirmwares/currentVersions',
    newApi: true
  },
  getSwitchFirmwareList: {
    method: 'post',
    url: '/switchFirmwares/schedules/switches/query',
    newApi: true
  },
  getSwitchFirmwareStatusList: {
    method: 'get',
    url: '/venues/:venueId/switchFirmwares/upgradeStatusDetails/query',
    newApi: true
  },
  getSwitchFirmwarePredownload: {
    method: 'get',
    url: '/switchFirmwares/preDownload',
    newApi: true
  },
  updateSwitchFirmwarePredownload: {
    method: 'put',
    url: '/switchFirmwares/preDownload',
    newApi: true
  }
}
