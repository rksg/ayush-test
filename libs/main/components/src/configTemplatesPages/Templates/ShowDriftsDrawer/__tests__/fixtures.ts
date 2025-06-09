import { ConfigTemplateType, ConfigTemplateDriftsResponse } from '@acx-ui/rc/utils'

export const mockedConfigTemplate = {
  id: '1',
  name: 'Template 1',
  createdOn: 1690598400000,
  createdBy: 'Author 1',
  appliedOnTenants: ['t1', '1969e24ce9af4348833968096ff6cb47'],
  type: ConfigTemplateType.NETWORK,
  lastModified: 1690598400000,
  lastApplied: 1690598405000
}

export const mockedDriftTenants = {
  page: 1,
  totalCount: 2,
  data: [{
    tenantId: '2242a683a7594d7896385cfef1fe1234'
  }, {
    tenantId: '350f3089a8e34509a2913c550faf1234'
  }]
}

export const mockedMSPCustomers = {
  totalCount: 2,
  page: 1,
  data: [{
    id: '2242a683a7594d7896385cfef1fe1234',
    name: 'Customer1',
    entitlements: [
      {
        expirationDateTs: '1680134399000',
        consumed: '0',
        quantity: '1',
        entitlementDeviceType: 'DVCNWTYPE_SWITCH',
        tenantId: '2242a683a7594d7896385cfef1fe1234',
        type: 'entitlement',
        expirationDate: '2023-03-29T23:59:59Z',
        entitlementDeviceSubType: 'ICX71',
        toBeRemovedQuantity: 0
      },
      // eslint-disable-next-line max-len
      { expirationDateTs: '1680134399000',consumed: '2',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_WIFI',
        // eslint-disable-next-line max-len
        tenantId: '2242a683a7594d7896385cfef1fe1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',toBeRemovedQuantity: 2 }
    ],
    wifiLicenses: 2,
    switchLicenses: 1
  },
  { id: '350f3089a8e34509a2913c550faf1234',
    name: 'Customer2',
    entitlements: [
      // eslint-disable-next-line max-len
      { expirationDateTs: '1680134399000',consumed: '0',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_WIFI',tenantId: '350f3089a8e34509a2913c550faf1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',toBeRemovedQuantity: 0 },
      // eslint-disable-next-line max-len
      { expirationDateTs: '1680134399000',consumed: '0',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_SWITCH',tenantId: '350f3089a8e34509a2913c550faf1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',entitlementDeviceSubType: 'ICX71',toBeRemovedQuantity: 0 }
    ],
    wifiLicenses: 2,
    switchLicenses: 2
  }]
}

export const mockedDriftResponse: ConfigTemplateDriftsResponse = [
  {
    diffName: 'WifiNetwork',
    diffData: [
      {
        path: '/wlan/advancedCustomization/qosMirroringEnabled',
        data: {
          template: true,
          instance: false
        }
      },
      {
        path: '/wlan/ssid',
        data: {
          template: 'test-int',
          instance: 'nms-test-int'
        }
      },
      {
        path: '/name',
        data: {
          template: 'raymond-test-int',
          instance: 'nms-raymond-test-int'
        }
      }
    ]
  },
  {
    diffName: 'RadiusOnWifiNetwork',
    diffData: [
      {
        path: '/id',
        data: {
          template: 'ef3644beccdf48ccb4e8cf3ed296070f',
          instance: 'dc2146381a874d04a824bdd8c7bb991d'
        }
      },
      {
        path: '/idName',
        data: {
          template: 'radius-template-name',
          instance: 'radius-server-name'
        }
      }
    ]
  }
]
