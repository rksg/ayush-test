export const PROFILE_MAX_COUNT_ACCESS_CONTROL = 63

export const PROFILE_MAX_COUNT_DEVICE_POLICY = 1000

export const PROFILE_MAX_COUNT_APPLICATION_POLICY = 63

export const PROFILE_MAX_COUNT_LAYER2_POLICY = 1280

export const PROFILE_MAX_COUNT_LAYER3_POLICY = 1280

export const QUERY_DEFAULT_PAYLOAD = {
  searchString: '',
  fields: [
    'id',
    'name'
  ],
  page: 1,
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'DESC'
}

export const DEFAULT_LAYER3_RULES = [
  {
    priority: 1,
    description: 'Allow DHCP',
    access: 'ALLOW',
    protocol: 'ANYPROTOCOL',
    source: {
      type: 'Any',
      subnet: '',
      ipMask: '',
      ip: '',
      port: ''
    },
    destination: {
      type: 'Any',
      subnet: '',
      ipMask: '',
      ip: '',
      port: '67'
    }
  },
  {
    priority: 2,
    description: 'Allow DNS',
    access: 'ALLOW',
    protocol: 'ANYPROTOCOL',
    source: {
      type: 'Any',
      subnet: '',
      ipMask: '',
      ip: '',
      port: ''
    },
    destination: {
      type: 'Any',
      subnet: '',
      ipMask: '',
      ip: '',
      port: '53'
    }
  }
]
