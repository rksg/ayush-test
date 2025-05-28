/* eslint-disable max-len */
import { timelineApi }                               from '@acx-ui/rc/services'
import { CommonUrlsInfo }                            from '@acx-ui/rc/utils'
import { Provider, store }                           from '@acx-ui/store'
import { mockRestApiQuery, render, screen, waitFor } from '@acx-ui/test-utils'

import ApWiredClientEventTab from '.'

const eventsForQuery = {
  data: [{
    apMac: '34:20:e3:21:f8:50',
    clientMac: '94:10:3e:b7:df:71',
    clientName: '94103eb7df71',
    entity_id: '94:10:3e:b7:df:71',
    entity_type: 'CLIENT',
    event_datetime: '2025-05-18T18:30:05Z',
    id: 'e928dc599e914ed89790c9d719a5c07f',
    indexName: 'events-2025.05.18-000990',
    macAddress: '94:10:3e:b7:df:71',
    message: '{"data":{"apName":{"entityType":"AP","entityId":"serialNumber"}},"message_template":"User @@clientName information updated from AP %%apName."}',
    name: 'WiredClientInfoUpdate',
    product: 'WIFI',
    serialNumber: '312002019061',
    severity: 'Info',
    userName: '94103eb7df71',
    venueId: 'e6745459c4e74114aaccb28dfbc78539'
  }, {
    apMac: '34:20:e3:21:f8:50',
    clientMac: '94:10:3e:b7:df:71',
    clientName: '94103eb7df71',
    entity_id: '94:10:3e:b7:df:71',
    entity_type: 'CLIENT',
    event_datetime: '2025-05-18T18:30:03Z',
    id: '8153ba0da66d4aaf8b3dcfefac18c93f',
    indexName: 'events-2025.05.18-000990',
    macAddress: '94:10:3e:b7:df:71',
    message: '{"data":{"apName":{"entityType":"AP","entityId":"serialNumber"}},"message_template":"User @@clientName join to AP %%apName."}',
    name: 'WiredClientJoin',
    product: 'WIFI',
    serialNumber: '312002019061',
    severity: 'Info',
    userName: '94103eb7df71',
    venueId: 'e6745459c4e74114aaccb28dfbc78539'
  }],
  subsequentQueries: [
    {
      fields: [
        'apName',
        'switchName',
        'recipientName',
        'networkId',
        'venueName',
        'floorPlanName',
        'apGroupName',
        'apGroupId',
        'administratorEmail'
      ],
      url: '/events/metas/query'
    }
  ],
  totalCount: 2,
  fields: [
    'clientMac',
    'networkName',
    'remoteEdgeId',
    'radio',
    'hostname',
    'action',
    'adminEmail',
    'serialNumber',
    'minimumRequiredVersion',
    'ipAddress',
    'apMac',
    'entity_id',
    'transactionId',
    'adminName',
    'macAddress',
    'detailedDescription',
    'sourceType',
    'name',
    'macAcl',
    'profileName',
    'dpName',
    'clientName',
    'ssid',
    'duration',
    'event_datetime',
    'venueId',
    'portList',
    'severity',
    'product',
    'turnOffTimestamp',
    'message',
    'serviceName',
    'userName',
    'turnOnTimestamp',
    'macOui',
    'clientMldMac',
    'entity_type',
    'lldpTlv',
    'apModel',
    'authenticationType'
  ]
}

const eventsMetaForQuery = {
  data: [{
    apName: 'bdc_vara_ap',
    switchName: '312002019061',
    id: 'c65c5525dfdb42689fe1fc7facf3861f',
    isRemoteedgeExists: false,
    isVenueExists: true,
    venueName: 'BDC_VARA_VENUE',
    isRemoteApExists: false,
    edgeName: '312002019061',
    isEdgeExists: false,
    isClientExists: false,
    apGroupId: '15b8f5adc7564d9d93db139dd61ad017',
    isApExists: true,
    isSwitchExists: false
  }, {
    apName: 'bdc_vara_ap',
    switchName: '312002019061',
    id: '7039d74566ce430f93f1a17dac748230',
    isRemoteedgeExists: false,
    isVenueExists: true,
    venueName: 'BDC_VARA_VENUE',
    isRemoteApExists: false,
    edgeName: '312002019061',
    isEdgeExists: false,
    isClientExists: false,
    apGroupId: '15b8f5adc7564d9d93db139dd61ad017',
    isApExists: true,
    isSwitchExists: false
  }],
  fields: [
    'apName',
    'switchName',
    'networkName',
    'networkId',
    'administratorEmail',
    'venueName',
    'apGroupId',
    'floorPlanName',
    'recipientName'
  ]
}


describe('AP Wired Client Details - Event tab', () => {
  beforeEach(() => {
    store.dispatch(timelineApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', eventsForQuery)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMetaForQuery)
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'event'
    }
    render(<Provider><ApWiredClientEventTab /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wired/wifi/clients/:clientId/details/:activeTab' }
    })
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2) // There are two event data
  })
})