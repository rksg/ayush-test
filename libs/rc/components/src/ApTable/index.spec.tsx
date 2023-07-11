import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  findTBody,
  mockServer,
  render,
  screen,
  waitFor,
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
      fwVersion: '6.2.0.103.486', // valid Ap Fw version for reset
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
        ],
        lanPortStatus: [
          {
            phyLink: 'Down ',
            port: '0'
          },
          {
            phyLink: 'Up 1000Mbps full',
            port: '1'
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: '',
      poePort: '1'
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

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

type MockDrawerProps = React.PropsWithChildren<{
  visible: boolean
  importRequest: () => void
  onClose: () => void
}>
jest.mock('../ImportFileDrawer', () => ({
  ...jest.requireActual('../ImportFileDrawer'),
  ImportFileDrawer: ({ importRequest, onClose, visible }: MockDrawerProps) =>
    visible && <div data-testid={'ImportFileDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        importRequest()
      }}>Import</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>
}))

describe('Aps', () => {
  afterEach(() => mockedUsedNavigate.mockClear())
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render correctly', async () => {
    render(<Provider><ApTable /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    for (const [index, item] of Object.entries(list.data)) {
      expect(await within(rows[Number(index)]).findByText(item.name)).toBeVisible()
    }
  })

  it('Table action bar Download Log and Reboot', async () => {
    render(<Provider><ApTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const fakeDownloadUrl = '/api/abc'
    const rebootSpy = jest.fn()
    rebootSpy.mockReturnValueOnce(true)

    mockServer.use(
      rest.patch(
        WifiUrlsInfo.rebootAp.url,
        (req, res, ctx) => rebootSpy() && res(ctx.json({ requestId: '456' }))
      ),
      rest.get(
        WifiUrlsInfo.downloadApLog.url,
        (req, res, ctx) => res(ctx.json({ fileURL: fakeDownloadUrl }))
      )
    )

    const row1 = await screen.findByRole('row', { name: /10.00.000.101/i })
    expect(row1).toHaveTextContent('mock-ap-1')
    expect(await within(row1).findByRole('checkbox')).not.toBeChecked()

    await userEvent.click(await within(row1).findByText('10.00.000.101'))
    expect(await within(row1).findByRole('checkbox')).toBeChecked()

    const downloadButton = await screen.findByRole('button', { name: 'Download Log' })
    await userEvent.click(downloadButton)

    const toast = await screen.findByText('Preparing log', { exact: false })
    expect(toast).toBeVisible()

    expect(await screen.findByText('Log is ready.', { exact: false })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Reboot' }))
    const rebootDialog = await waitFor(async () => screen.findByRole('dialog'))
    await userEvent.click(await within(rebootDialog).findByRole('button', { name: 'Reboot' }))
    expect(rebootSpy).toHaveBeenCalled()
  })

  it('Table action bar Delete', async () => {
    render(<Provider><ApTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const deleteSpy = jest.fn()
    deleteSpy.mockReturnValueOnce(true)

    mockServer.use(
      rest.post(
        WifiUrlsInfo.getDhcpAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456', response: [{
          venueDhcpEnabled: true
        }] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteAp.url,
        (req, res, ctx) => deleteSpy() && res(ctx.json({ requestId: '456' }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteAps.url,
        (req, res, ctx) => deleteSpy() && res(ctx.json({ requestId: '456' }))
      )
    )

    const row1 = await screen.findByRole('row', { name: /mock-ap-1/i }) // select ap 1: operational
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('button', { name: 'Delete' })).toBeDisabled()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    await userEvent.click(row1) // unselect ap 1
    expect(await within(row1).findByRole('checkbox')).not.toBeChecked()

    const row2 = await screen.findByRole('row', { name: /mock-ap-2/i })
    await userEvent.click(row2) // select ap 2: DisconnectedFromCloud

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('checkbox', { checked: true })
    expect(rows).toHaveLength(1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog2 = await screen.findByRole('dialog')
    expect(await within(dialog2).findByRole('button', { name: 'Delete' })).not.toBeDisabled()

    await userEvent.click(await within(dialog2).findByRole('button', { name: 'Delete' }))

    expect(deleteSpy).toHaveBeenCalled()
  }, 60000)

  it('Table action bar Edit', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.DEVICES || ff === Features.EXPORT_DEVICE) ? true : false
    })

    render(<Provider><ApTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const row = await screen.findByRole('row', { name: /mock-ap-1/i })
    await within(row).findByRole('checkbox', { checked: false })

    await userEvent.click(await screen.findByRole('row', { name: /mock-ap-1/i }))

    const toolbar = await screen.findByRole('alert')
    await userEvent.click(await within(toolbar).findByRole('button', { name: 'Edit' }))

    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('should render with filterables', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApGroupsListByGroup.url,
        (req, res, ctx) => res(ctx.json({
          data: [{
            clients: 0,
            deviceGroupId: '',
            deviceGroupName: '',
            incidents: 0,
            members: 0
          }]
        }))
      )
    )
    render(<Provider><ApTable filterables={{
      venueId: [],
      deviceGroupId: []
    }}/></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const combos = await screen.findAllByRole('combobox')
    expect(combos).toHaveLength(4)

    await userEvent.click(combos[3])
    await userEvent.click(await screen.findByTitle('AP Group'))

    await waitFor(() => expect(screen.getByText('Ungrouped APs')).toBeVisible())
  })

  it('should import correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.AP_GPS ? true : false
    })

    mockServer.use(
      rest.post(
        WifiUrlsInfo.addAp.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(<Provider><ApTable enableActions={true} /></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Add AP' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add AP Group' }))
    expect(mockedUsedNavigate).toHaveBeenCalledTimes(2)

    expect(await screen.findByText('Import APs')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Import APs' }))

    const drawer = await screen.findByTestId('ImportFileDrawer')
    expect(drawer).toBeVisible()

    await userEvent.click(await within(drawer).findByRole('button', { name: 'Import' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
  })
})
