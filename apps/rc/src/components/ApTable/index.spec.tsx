import '@testing-library/jest-dom'
import FileSaver from 'file-saver'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

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

    render(<Provider><ApTable /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    // expect(asFragment()).toMatchSnapshot() //TODO: <StackedBarChart
  })

  it('Table action bar Download Log and Reboot', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    render(<Provider><ApTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const fakeDownloadUrl = '/api/abc'
    const downloadSpy = jest.spyOn(FileSaver, 'saveAs')
    const rebootSpy = jest.fn()

    mockServer.use(
      rest.post(
        WifiUrlsInfo.rebootAp.url,
        (req, res, ctx) => rebootSpy() || res(ctx.json({ requestId: '456' }))
      ),
      rest.get(
        WifiUrlsInfo.downloadApLog.url,
        (req, res, ctx) => res(ctx.json({ fileURL: fakeDownloadUrl }))
      )
    )

    const row1 = await screen.findByRole('row', { name: /10.00.000.101/i })
    expect(row1).toHaveTextContent('mock-ap-1')
    expect(within(row1).getByRole('checkbox')).not.toBeChecked()

    fireEvent.click(await within(row1).findByText('10.00.000.101'))
    expect(within(row1).getByRole('checkbox')).toBeChecked()

    const downloadButton = screen.getByRole('button', { name: 'Download Log' })
    fireEvent.click(downloadButton)

    const toast = await screen.findByText('Preparing log', { exact: false })
    expect(toast).toBeVisible()

    await waitFor(async () => screen.findByText('Log is ready.', { exact: false }))

    await waitFor(() => expect(downloadSpy).toHaveBeenCalled())

    fireEvent.click(await screen.findByRole('button', { name: 'Reboot' }))
    const rebootDialog = await waitFor(async () => screen.findByRole('dialog'))
    fireEvent.click(within(rebootDialog).getByRole('button', { name: 'Reboot' }))
    await waitFor(() => expect(rebootSpy).toHaveBeenCalled())

    jest.restoreAllMocks()
  })

  it('Table action bar Delete', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    render(<Provider><ApTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const deleteSpy = jest.fn()

    mockServer.use(
      rest.post(
        WifiUrlsInfo.getDhcpAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456', response: [{
          venueDhcpEnabled: true
        }] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteAp.url,
        (req, res, ctx) => deleteSpy() || res(ctx.json({ requestId: '456' }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteAps.url,
        (req, res, ctx) => deleteSpy() || res(ctx.json({ requestId: '456' }))
      )
    )

    const row1 = await screen.findByRole('row', { name: /mock-ap-1/i }) // select ap 1: operational
    fireEvent.click(row1)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    expect(within(dialog).getByRole('button', { name: 'Delete AP' })).toBeDisabled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    fireEvent.click(row1) // unselect ap 1
    expect(within(row1).getByRole('checkbox')).not.toBeChecked()

    const row2 = await screen.findByRole('row', { name: /mock-ap-2/i })
    fireEvent.click(row2) // select ap 2: DisconnectedFromCloud

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!
    const rows = await within(tbody).findAllByRole('checkbox', { checked: true })
    expect(rows).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog2 = await waitFor(async () => screen.findByRole('dialog'))
    expect(within(dialog2).getByRole('button', { name: 'Delete AP' })).not.toBeDisabled()

    fireEvent.click(within(dialog2).getByRole('button', { name: 'Delete AP' }))

    await waitFor(() => expect(deleteSpy).toHaveBeenCalled())

    await waitFor(async () => expect(within(row2).getByRole('checkbox')).not.toBeChecked())

    fireEvent.click(await screen.findByRole('row', { name: /mock-ap-1/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
  }, 35000)
})
