import { Demo } from '@acx-ui/rc/utils'

export const mockedNetworks = {
  fields: [
    'id',
    'name',
    'nwSubType',
    'captiveType',
    'network',
    'venues',
    'clients'
  ],
  totalCount: 4,
  page: 1,
  data: [
    {
      id: '1',
      name: 'NetA',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Self Sign In'
      },
      venues: { count: 0, names: [] },
      clients: 88
    },
    {
      id: '7',
      name: 'NetB',
      nwSubType: 'guest',
      captiveType: 'GuestPass',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
        name: 'Network B',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 64
    },
    {
      id: '8',
      name: 'NetC',
      nwSubType: 'guest',
      captiveType: 'ClickThrough',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
        name: 'Network C',
        captiveType: 'Click Through'
      },
      venues: { count: 1, names: [] },
      clients: 86
    },
    {
      id: '4',
      name: 'NetD',
      nwSubType: 'guest',
      captiveType: 'HostApproval',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
        name: 'Network E',
        captiveType: 'Host Approval'
      },
      venues: { count: 2, names: [] },
      clients: 70
    }
  ]
}

export const mockedWifiNetworks = {
  fields: [
    'id',
    'name',
    'nwSubType',
    'captiveType',
    'venues'
  ],
  totalCount: 4,
  page: 1,
  data: [
    {
      id: 'c7f79a85e76241199d78c52a491af29c',
      name: 'NetU',
      nwSubType: 'guest',
      captiveType: 'HostApproval',
      venueApGroups: [ { venueId: ['NetU_vId1','NetU_vId2'] }]
    }
  ]
}

export const mockedNetworkTemplates = {
  fields: [
    'id',
    'name',
    'nwSubType',
    'captiveType',
    'network',
    'venues',
    'clients'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '1',
      name: 'NetT',
      nwSubType: 'guest',
      captiveType: 'GuestPass',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 88
    }
  ]
}

export const mockDetailResult = {
  id: 1,
  serviceName: 'test',
  content: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    bgColor: '#FFFFFF',
    bgImage: '',
    welcomeSize: 14,
    photoRatio: 170,
    logoRatio: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
      ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
    poweredImg: '',
    poweredBgColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: 14,
    poweredImgRatio: 50,
    wifi4EUNetworkId: '',
    termsCondition: '',
    componentDisplay: {
      logo: true,
      welcome: true,
      photo: true,
      secondaryText: true,
      termsConditions: false,
      poweredBy: true,
      wifi4eu: false
    },
    displayLangCode: 'en',

    alternativeLang:

        { cs: true, zh_TW: false, fi: true,
          fr: true, de: true, el: true, hu: true, it: false }
  } as Demo
}

export const mockedWifiNetworkTemplates = {
  fields: [
    'id',
    'name',
    'nwSubType',
    'captiveType',
    'network',
    'venueApGroups.venueId'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '1',
      name: 'NetQ',
      nwSubType: 'guest',
      captiveType: 'GuestPass',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Guest Pass'
      },
      venueApGroups: [{ venueId: ['NetQ_vId1'] }]
    }
  ]
}

export const mockClientInfos = {
  fields: [
    'networkInformation',
    'macAddress'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      modelName: 'Apple iPhone/iOS 17.5.1',
      deviceType: 'Smartphone',
      macAddress: 'ba:6a:9e:3f:74:a4',
      osType: 'iOS',
      ipAddress: '10.206.79.64',
      username: 'ca6d9f3f74a4',
      hostname: 'ca:6d:9f:3f:74:a4',
      authenticationStatus: 1,
      connectedTime: '2024-07-08T11:56:57.196Z',
      lastUpdatedTime: '2024-07-08T12:11:51.534Z',
      venueInformation: {
        id: '0e2f68ab79154ffea64aa52c5cc48826',
        name: 'My-Venue'
      },
      apInformation: {
        serialNumber: '302002030366',
        name: 'R550-302002030366',
        macAddress: '34:20:E3:1D:0C:50',
        bssid: '34:20:e3:9d:0c:50'
      },
      networkInformation: {
        id: 'c7f79a85e76241199d78c52a491af29c',
        type: 'guest',
        ssid: '==Guest==',
        encryptionMethod: 'None',
        authenticationMethod: 'HotSpot(Wispr)+Mac',
        vlan: 1
      },
      signalStatus: {
        snr: 61,
        rssi: -35,
        noiseFloor: -96,
        health: 'Good',
        healthDescription: 'RSSI is Good\nSNR is Good\nThroughput is Good'
      },
      radioStatus: {
        type: 'a/n/ac/ax',
        channel: 60
      },
      trafficStatus: {
        trafficToClient: 5690468,
        trafficFromClient: 589456,
        packetsToClient: 32843,
        packetsFromClient: 2309,
        framesDropped: 0,
        totalTraffic: 6279924
      }
    }
  ]
}
