import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation, 
  ResidentPortal} from '@acx-ui/rc/utils'
import { CreateResidentPortalFormFields } from '../formParsing'
  
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
  textHelp: 'This is a test.'
}

export const mockedResidentPortal = {
  id: "9080bd9a-81f6-4321-9ff9-344ed4c5e1d6",
  name: "Mock Resident Portal",
  uiConfiguration: {
    type: "uiConfiguration",
    text: {
      loginText: "Welcome to your portal.",
      title: "Network Management Portal",
      subTitle: "For managing the network",
      announcements: "Announcing the property opening!",
      helpText: "Contact Property Management"
    }
  }
}

export const mockedResidentPortalList = {
  "content": [
    {
      "id": "91cfb798-ed23-4e8a-8332-f803bb40f387",
      "name": "Mocked Portal 1",
      "portalStatus": "ENABLED",
    },
    {
      "id": "50699897-f48a-4dbd-afaf-9b4dd9c9ccb6",
      "name": "Mocked Portal 2",
      "portalStatus": "ENABLED",
    }        
  ],
  "pageable": {
    "sort": {
      "unsorted": true,
      "sorted": false,
      "empty": true
    },
    "pageNumber": 0,
    "pageSize": 20,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalPages": 1,
  "totalElements": 2,
  "first": true,
  "numberOfElements": 2,
  "sort": {
    "unsorted": true,
    "sorted": false,
    "empty": true
  },
  "size": 20,
  "number": 0,
  "empty": false  
}
