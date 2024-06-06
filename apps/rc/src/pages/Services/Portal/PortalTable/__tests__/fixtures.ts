export const mockedPortalList = {
  content: [
    {
      serviceName: 'My Portal 111',
      id: '78f92fbf80334e8b83cddd3210db4921',
      content: {
        displayLangCode: 'en'
      }
    },
    {
      serviceName: 'PortalConfigServiceProfile1',
      id: '78f92fbf80334e8b83cddd3210db4920',
      networkIds: ['1', '2', '3'],
      content: {
        displayLangCode: 'en',
        poweredImg: 'test',
        logo: 'test',
        photo: 'test',
        bgImage: 'test',
        componentDisplay: {
          logo: true,
          welcome: true,
          photo: true,
          secondaryText: true,
          termsConditions: false,
          poweredBy: true,
          wifi4eu: true
        }
      }
    },
    {
      serviceName: 'My Portal 1',
      id: '78f92fbf80334e8b83cddd3210db4922',
      networkIds: ['1', '2', '3'],
      content: {
        displayLangCode: 'en'
      }
    },
    {
      serviceName: 'Hotel ABC',
      id: '78f92fbf80334e8b83cddd3210db4923',
      networkIds: ['1', '2', '3', '4'],
      content: {
        displayLangCode: 'en'
      }
    }
  ],
  paging: { page: 1, pageSize: 10, totalCount: 1 }
}
export const networksResponse = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: [{
    name: 'test1',
    id: '1'
  },{
    name: 'test2',
    id: '2'
  },{
    name: 'test3',
    id: '3'
  },{
    name: 'test4',
    id: '4'
  }]
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
