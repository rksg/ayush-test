import { FirmwareCategory } from '@acx-ui/rc/utils'

/* eslint-disable max-len */
export const cloudMessageBanner = {
  createdBy: 'd7fba54cb0e14c6cae48b90baf7e631c',
  createdDate: '2022-12-15T20:18:42.473+0000',
  description: 'we are aware of ongoing problem with User management, RUCKUS engineering is working on a solution',
  tenantType: 'MSP',
  id: 'MSP'
}

export const allUserSettings = {
  COMMON: '{"activity":{"showUnreadMark":true,"isFirstTime":true},"tab-license":"switch","tab-networking-devices":"switch","tab-users":"switch","tab-events-logs":"administrative-logs","tab-venue-clients":"wifi","tab-venue-networks":"switch","venues-list":{"columns":{"name":true,"description":true,"city":true,"country":true,"networks":true,"aggregatedApStatus":true,"switches":true,"clients":true,"switchClients":true},"columns-customization":{"switches":"90px"}}}',
  SWITCH: '{"switches-list":{"columns-customization":{"activeSerial":"149px","model":"244px","name":"205px"}}}',
  WIFI: '{"aps-list":{"columns-customization":{"name":"219px","switchName":"90px","serialNumber":"163px","deviceStatus":"137px","tags":"69px"},"columns":{"name":true,"deviceStatus":true,"model":true,"IP":true,"apMac":true,"venueName":true,"switchName":true,"meshRole":true,"clients":true,"deviceGroupName":true,"apStatusData.APRadio.band":true,"tags":true,"serialNumber":true,"fwVersion":false,"poePort":true}},"networks-list":{"columns-customization":{"nwSubType":"229px"}},"client-list":{"columns":{"osType":false,"healthCheckStatus":false,"clientMac":true,"ipAddress":false,"Username":false,"hostname":false,"venueId":false,"serialNumber":false,"switchSerialNumber":false,"ssid":false,"wifiCallingClient":false,"sessStartTime":false,"clientVlan":false,"deviceTypeStr":false,"modelName":false,"totalTraffic":false,"trafficToClient":false,"trafficFromClient":false,"receiveSignalStrength":false,"rssi":false,"radio.mode":false,"cpeMac":false,"authmethod":false,"status":false,"encryptMethod":false,"packetsToClient":false,"packetsFromClient":false,"packetsDropFrom":false,"radio.channel":false,"noiseFloor":false,"clientAnalytics":false}}}'
}

export const cloudVersion = {
  currentVersion: { id: 'acx', name: 'acx' },
  futureVersion: null,
  scheduleVersionList: null,
  slotId: null,
  versionUpgradeDate: null
}

export const scheduleVersion = {
  scheduleVersionList: ['6.2.1.103.2573', '6.2.1.103.2550']
}

export const switchVenueVersionList = {
  upgradeVenueViewList: [{
    availableVersions: [
      { id: '09010f_b19', name: '09010f_b19', category: 'RECOMMENDED' },
      { id: '10010_rc2', name: '10010_rc2', category: 'RECOMMENDED' }
    ],
    id: '923f6df894c340498894a6b7c68feaae',
    name: 'My-Venue',
    preDownload: true,
    witchFirmwareVersion: { id: '09010e_b392', name: '09010e_b392', category: 'RECOMMENDED' },
    switchFirmwareVersionAboveTen: { id: '10010_b176', name: '10010_b176', category: 'RECOMMENDED' },
    upgradeVenueViewList: null
  }]
}

export const venueEdgeFirmwareList = [
  {
    id: '1',
    name: 'My-Venue1',
    updatedDate: '2023-02-23T09:16:05.388+0000',
    versions: [
      {
        name: '1.0.0.1710',
        id: '1.0.0.1710',
        category: FirmwareCategory.RECOMMENDED,
        onboardDate: '2023-02-23T09:16:05.388+0000'
      }
    ],
    nextSchedule: {
      timeSlot: {
        startDateTime: '2023-08-26T02:00:00-07:00',
        endDateTime: '2023-08-26T04:00:00-07:00'
      },
      version: {
        id: '10010b_b37',
        name: '10010b_b37',
        category: 'RECOMMENDED'
      }
    }
  }
]