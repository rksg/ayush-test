import { ConfigTemplateType, TemplateInstanceDriftResponse } from '@acx-ui/rc/utils'

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

export const mockedDriftResponse: TemplateInstanceDriftResponse = {
  WifiNetwork: {
    '/wlan/advancedCustomization/qosMirroringEnabled': {
      template: true,
      instance: false
    },
    '/wlan/ssid': {
      template: 'raymond-test-int',
      instance: 'nms-raymond-test-int.'
    },
    '/name': {
      template: 'raymond-test-int',
      instance: 'nms-raymond-test-int.'
    }
  },
  RadiusOnWifiNetwork: {
    '/id': {
      template: 'ef3644beccdf48ccb4e8cf3ed296070f',
      instance: 'dc2146381a874d04a824bdd8c7bb991d'
    },
    '/idName': {
      template: 'radius-template-name',
      instance: 'radius-server-name'
    }
  }
}

const maxInstances = 18
const customerNames = [
  'Edu Hotels',
  'Campus Resorts',
  'Premier Lodges',
  'Health Group',
  'Wellness Retreats',
  'Care Hospitals',
  'Scholar Inn',
  'Graduate Services',
  'Learning Lodges',
  'Care Facilities',
  'Wellness Hotels',
  'Stay Centers',
  'Campus Suites',
  'Future Lodging',
  'Healing Hotels',
  'Study & Care',
  'Health Lodges',
  'Life Retreats'
]

export let mockedData: Array<{ id: string, name: string }> = []

for (let i = 0; i < maxInstances; i++) {
  mockedData.push({
    id: `id_${Math.floor(Math.random() * 100000)}`,
    name: customerNames[i]
  })
}
