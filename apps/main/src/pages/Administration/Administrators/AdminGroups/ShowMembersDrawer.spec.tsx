import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ShowMembersDrawer } from './ShowMembersDrawer'

/* eslint-disable max-len */
const events = {
  data: [
    {
      severity: 'Info',
      adminName: 'msp eleu1658',
      entity_type: 'ADMIN',
      event_datetime: '2023-01-16T20:55:20Z',
      ipAddress: '',
      id: '2e0d0ce655904d3b8e1404064b1175d1',
      entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
      message: '{ "message_template": "Admin msp eleu1658, msp.eleu1658@mail.com logged out the cloud controller." }'
    },
    {
      severity: 'Info',
      adminName: 'msp eleu1658',
      entity_type: 'ADMIN',
      event_datetime: '2023-01-16T17:22:47Z',
      ipAddress: '134.242.133.1',
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
    'ipAddress',
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

const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))

describe('Show member last login table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useAdminLogsQuery = jest.fn().mockImplementation(() => {
      return { data: events }
    })
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render table', async () => {
    render(
      <Provider>
        <ShowMembersDrawer
          visible={true}
          membersGroupId={'msp.eleu1658@mail.com'}
          setVisible={jest.fn()} />
      </Provider>, { route: { params } })

    // eslint-disable-next-line testing-library/no-node-access
    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Logged Group Members')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ok' })).toBeVisible()
  })

  it('should load data correctly', async () => {
    render(
      <Provider>
        <ShowMembersDrawer
          visible={true}
          membersGroupId={'msp.eleu1658@mail.com'}
          setVisible={jest.fn()} />
      </Provider>, { route: { params }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(2)
  })

})
