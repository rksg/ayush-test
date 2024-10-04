import { NewTablePageable } from '@acx-ui/rc/utils'

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

export const mockedApList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'mock-ap',
      apMac: '18:7C:0B:10:29:50',
      serialNumber: '125488555569',
      venueId: 'mock_venue_1',
      model: 'R510',
      apStatusData: {
        lanPortStatus: [{ port: '0' }, { port: '1' }, { port: '2' }],
        vxlanStatus: { vxlanMtu: 666 }
      }
    },
    {
      name: 'mock-ap2',
      apMac: '18:7C:0B:10:29:51',
      serialNumber: '150000000761',
      venueId: 'mock_venue_1',
      model: 'R760',
      apStatusData: { lanPortStatus: [{ port: '0' }] }
    }
  ]
}

const personaPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}

export const mockedPersonaList = {
  pageable: personaPageable,
  sort: personaPageable.sort,
  totalPages: 1,
  totalElements: 3,
  content: [
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      parentId: null,
      description: null,
      name: 'mock-persona',
      email: null,
      tenantId: 'c626f130cb31431d93c10cb2cc02c40b',
      dpskGuid: '2fb6dee3cfdb4b9aba61bbb5f5f4ba47',
      dpskPassphrase: 'sim-tool12345683',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 3000,
      devices: null,
      deviceCount: 0,
      ethernetPorts: [
        {
          name: 'testAp',
          portIndex: 1
        }
      ],
      switches: [
        {
          macAddress: 'd4:c1:9e:1f:8b:5d',
          portId: 1,
          personaId: 'be5359c4-0fc6-4386-a41d-d1834e75694f'
        }
      ],
      primary: true
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      parentId: null,
      description: null,
      name: 'mock-persona2',
      email: null,
      tenantId: 'c626f130cb31431d93c10cb2cc02c40b',
      dpskGuid: '2fb6dee3cfdb4b9aba61bbb5f5f4ba47',
      dpskPassphrase: 'sim-tool12345683',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 3001,
      devices: ['AP-1'],
      deviceCount: 1,
      ethernetPorts: [],
      switches: null,
      primary: true
    }
  ]

}