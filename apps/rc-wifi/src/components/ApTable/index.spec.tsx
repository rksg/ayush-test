import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                                from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { ApTable } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '000000000001',
      name: 'mock-ap-1',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.00.000.101',
      apMac: '00:00:00:00:00:01',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000002',
      name: 'mock-ap-2',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '3_04_DisconnectedFromCloud',
      IP: '10.00.000.102',
      apMac: '00:00:00:00:00:02',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: '',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000003',
      name: 'mock-ap-3',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '4_01_Rebooting',
      IP: '10.00.000.103',
      apMac: '00:00:00:00:00:03',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000004',
      name: 'mock-ap-4',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '1_07_Initializing',
      IP: '10.00.000.104',
      apMac: '00:00:00:00:00:04',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000005',
      name: 'mock-ap-5',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      IP: '10.00.000.105',
      deviceStatus: '',
      apMac: '00:00:00:00:00:05',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'EMAP',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }
  ]
}


describe('Aps', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(<Provider><ApTable /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.serialNumber)).toBeVisible()
    })

    expect(asFragment()).toMatchSnapshot()
  })
})
