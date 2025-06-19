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

export const venueApModelFirmwareList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '22a7165d35b44695b40ec22b68189111',
      name: 'Venue02',
      nextApFirmwareSchedules: [
        {
          startDateTime: '2024-09-04T16:00:00Z',
          versionInfo: {
            version: '7.0.0.104.1304',
            type: 'AP_FIRMWARE_UPGRADE',
            category: 'RECOMMENDED'
          }
        }
      ]
    }
  ]
}
