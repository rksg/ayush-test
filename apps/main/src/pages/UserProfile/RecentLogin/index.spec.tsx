import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockRestApiQuery,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { RecentLogin } from '.'

/* eslint-disable max-len */
const events = {
  data: [
    {
      severity: 'Info',
      adminName: 'msp eleu1658',
      entity_type: 'ADMIN',
      event_datetime: '2023-01-16T20:55:20Z',
      id: '2e0d0ce655904d3b8e1404064b1175d1',
      entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
      message: '{ "message_template": "Admin msp eleu1658, msp.eleu1658@mail.com logged into the cloud controller." }'
    },
    {
      severity: 'Info',
      adminName: 'msp eleu1658',
      entity_type: 'ADMIN',
      event_datetime: '2023-01-16T17:22:47Z',
      id: '2e0d0ce655904d3b8e1404064b1175d4',
      entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
      message: '{ "message_template": "Admin msp eleu1658, msp.eleu1658@mail.com logged into the cloud controller." }'
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'apName',
        'switchName',
        'networkName',
        'networkId',
        'administratorEmail',
        'venueName',
        'apGroupId',
        'apGroupName',
        'floorPlanName',
        'recipientName'
      ],
      url: '/api/eventalarmapi/662b4f2c76a0428a9e7faaa64534d67a/event/meta'
    }
  ],
  totalCount: 2,
  fields: [
    'event_datetime',
    'severity',
    'entity_type',
    'entity_id',
    'message',
    'apMac',
    'clientMac',
    'serialNumber',
    'ssid',
    'radio',
    'raw_event',
    'product',
    'sourceType',
    'adminName',
    'clientName',
    'userName',
    'hostname',
    'adminEmail',
    'venueId',
    'transactionId'
  ]
}

const eventsMeta = {
  data: [
    {
      id: '2e0d0ce655904d3b8e1404064b1175d1',
      isApExists: false,
      isSwitchExists: false
    },
    {
      id: '2e0d0ce655904d3b8e1404064b1175d4',
      isApExists: false,
      isSwitchExists: false
    }
  ],
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

describe('Recent login table', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', events)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMeta)
  })
  it('should render table', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events)))
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    render(<Provider><RecentLogin userEmail={'msp.eleu1658@mail.com'} /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(3)
  })
})
