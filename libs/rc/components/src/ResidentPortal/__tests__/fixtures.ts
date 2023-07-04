import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation } from '@acx-ui/rc/utils'

import { CreateResidentPortalFormFields } from '../ResidentPortalForm/formParsing'

export const mockedTenantId = '__Tenant_ID__'

export const mockedServiceId = '__Service_ID__'

// eslint-disable-next-line max-len
export const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.CREATE })
// eslint-disable-next-line max-len
export const editPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.EDIT })


export const mockedCreateFormData: CreateResidentPortalFormFields = {
  serviceName: 'New Resident Portal',
  textTitle: 'Welcome',
  textSubtitle: 'This is a Mocked Portal',
  textLogin: 'Login Please',
  textAnnouncements: 'Announcing a Mocked Portal',
  textHelp: 'This is a test.',
  tenantSetDpsk: true,
  colorMain: '',
  colorAccent: '',
  colorSeparator: '',
  colorText: '',
  fileLogo: { file: new File(['testLogo'], 'testLogo.png', { type: 'image/png' }) },
  fileFavicon: { file: new File(['testFavicon'], 'testFavicon.png', { type: 'image/png' }) }
}

export const mockedResidentPortal = {
  id: '9080bd9a-81f6-4321-9ff9-344ed4c5e1d6',
  name: 'Mock Resident Portal',
  uiConfiguration: {
    type: 'uiConfiguration',
    access: {
      tenantSetDpsk: true
    },
    text: {
      loginText: 'Welcome to your portal.',
      title: 'Network Management Portal',
      subTitle: 'For managing the network',
      announcements: 'Announcing the property opening!',
      helpText: 'Contact Property Management'
    },
    color: {
      mainColor: '#34eb58',
      accentColor: '#9221b5',
      separatorColor: '#213eb5',
      textColor: '#b59221'
    },
    files: {
      logoFileName: 'container_condos_transparent.png',
      favIconFileName: 'containerland.png'
    }
  }
}

export const mockedResidentPortalList = {
  content: [
    {
      id: '91cfb798-ed23-4e8a-8332-f803bb40f387',
      name: 'Mocked Portal 1',
      portalStatus: 'ENABLED'
    },
    {
      id: '50699897-f48a-4dbd-afaf-9b4dd9c9ccb6',
      name: 'Mocked Portal 2',
      portalStatus: 'ENABLED'
    }
  ],
  pageable: {
    sort: {
      unsorted: true,
      sorted: false,
      empty: true
    },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: true,
  totalPages: 1,
  totalElements: 2,
  first: true,
  numberOfElements: 2,
  sort: {
    unsorted: true,
    sorted: false,
    empty: true
  },
  size: 20,
  number: 0,
  empty: false
}

export const mockedDetailedResidentPortalList = {
  content: [
    {
      id: '91cfb798-ed23-4e8a-8332-f803bb40f387',
      name: 'Mocked Portal 1',
      portalStatus: 'ENABLED',
      venueCount: 1,
      uiConfiguration: {
        type: 'uiConfiguration',
        text: {
          loginText: 'Login Text 1',
          title: 'Title 1',
          subTitle: 'Subtitle 1',
          announcements: 'Announcements 1',
          helpText: 'Help Text 1'
        }
      }
    },
    {
      id: '50699897-f48a-4dbd-afaf-9b4dd9c9ccb6',
      name: 'Mocked Portal 2',
      portalStatus: 'ENABLED',
      venueCount: 0,
      uiConfiguration: {
        type: 'uiConfiguration',
        text: {
          loginText: 'Login Text 2',
          title: 'Title 2',
          subTitle: 'Subtitle 2',
          announcements: 'Announcements 2',
          helpText: 'Help Text 2'
        }
      }
    }
  ],
  pageable: {
    sort: {
      unsorted: true,
      sorted: false,
      empty: true
    },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: true,
  totalPages: 1,
  totalElements: 2,
  first: true,
  numberOfElements: 2,
  sort: {
    unsorted: true,
    sorted: false,
    empty: true
  },
  size: 20,
  number: 0,
  empty: false
}

export const mockPropertyConfigs = {
  content: [
    {
      venueId: '263a60d7e2224ec2a20f2f02d6372aca',
      venueName: 'Venue 2',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '1dcb4608-af74-46f8-80e8-962f642062d6',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    },
    {
      venueId: 'b4328c2f212b40548b18ca1e413ac54d',
      venueName: 'Venue 11',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '2c3ef9fe-7e35-4c42-8574-489e07835499',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    }
  ],
  pageable: {
    sort: {
      unsorted: true,
      sorted: false,
      empty: true
    },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: true,
  totalPages: 1,
  totalElements: 12,
  first: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: true
  },
  numberOfElements: 12,
  size: 20,
  number: 0,
  empty: false
}
