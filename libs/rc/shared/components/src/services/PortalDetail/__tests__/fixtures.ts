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