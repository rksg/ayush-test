export const mockList = {
  fields: [
    'id',
    'network',
    'venues',
    'health',
    'abandonmentRate',
    'clients',
    'clientsPortal'
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
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 88
    },
    {
      id: '7',
      name: 'NetB',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
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
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
        name: 'Network C',
        captiveType: 'Self Sign In'
      },
      venues: { count: 1, names: [] },
      clients: 86
    },
    {
      id: '4',
      name: 'NetD',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
        name: 'Network E',
        captiveType: 'Self Sign In'
      },
      venues: { count: 2, names: [] },
      clients: 70
    }
  ]
}
export const mockDetailResult = {
  id: 1,
  serviceName: 'test',
  content: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    bgImage: '',
    bgColor: '#FFFFFF',
    welcomeSize: 14,

    photoRatio: 170,

    logoRatio: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
      ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
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
  }
}

export const mockDetailChangeResult = {
  id: 1,
  serviceName: 'test',
  content: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    bgColor: '#FFFFFF',
    welcomeSize: 14,
    logo: 'logo',
    photo: 'photo',
    bgImage: 'bgimage',
    poweredImg: 'poweredimg',
    photoRatio: 170,

    logoRatio: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, consectetur adipiscing'+
      ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
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
      wifi4eu: true
    },
    displayLangCode: 'en',

    alternativeLang:

        { cs: true, zh_TW: false, fi: true,
          fr: true, de: true, el: true, hu: true, it: false }
  },
  networkIds: [1, 2]
}