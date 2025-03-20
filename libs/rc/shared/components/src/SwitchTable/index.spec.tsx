import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { switchApi }                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchRbacUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                    from '@acx-ui/store'
import {
  cleanup,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  findTBody
} from '@acx-ui/test-utils'
import { SwitchScopes }                   from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import { SwitchTable } from '.'

const switchList = {
  totalCount: 2,
  page: 1,
  data: [
    { id: 'FEK4224R19X',
      model: 'ICX7150-C12P',
      serialNumber: 'FEK4224R19X',
      activeSerial: 'FEK4224R19X',
      deviceStatus: 'PREPROVISIONED',
      switchMac: 'C0:C5:20:82:CF:6C',
      isStack: false,
      name: 'FEK4224R19X',
      venueId: 'eb4ef94ba7014f64b69be926faccbc09',
      venueName: 'test',
      configReady: false,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: true,
      suspendingDeployTime: '' },
    {
      id: 'FMF2249Q0JT',
      model: 'ICX7150-C08P',
      serialNumber: 'FMF2249Q0JT',
      activeSerial: 'FMF2249Q0JT',
      deviceStatus: 'PREPROVISIONED',
      switchMac: '',
      isStack: false,
      name: 'FMF2249Q0JT',
      venueId: '5c05180d54d84e609a4d653a3a8332d1',
      venueName: 'My-Venue',
      configReady: false,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: false,
      suspendingDeployTime: ''
    }, {
      activeSerial: 'FEK3224R0AG',
      cliApplied: false,
      clientCount: 2,
      configReady: true,
      deviceStatus: 'ONLINE',
      firmware: 'SPR09010f',
      id: 'c0:c5:20:aa:32:79',
      ipAddress: '10.206.10.27',
      isStack: false,
      model: 'ICX7150-C12P',
      name: 'ICX7150-C12 Router',
      serialNumber: 'FEK3224R0AG',
      suspendingDeployTime: '',
      switchMac: 'c0:c5:20:aa:32:79',
      switchName: 'ICX7150-C12 Router',
      switchType: 'router',
      syncDataEndTime: '',
      syncDataId: '',
      syncedAdminPassword: true,
      syncedSwitchConfig: true,
      uptime: '7 days, 0 hours',
      venueId: '81e0fac39cee430992e9f770fce3645b',
      venueName: 'My-Venue'
    }, {
      activeSerial: 'FEK3224R1AG',
      cliApplied: false,
      clientCount: 2,
      configReady: true,
      deviceStatus: 'ONLINE',
      firmware: 'SPR09010f',
      id: 'c0:c5:20:aa:32:78',
      ipAddress: '10.206.10.27',
      isStack: false,
      model: 'ICX7150-C12P',
      name: 'ICX7150-C12 Router',
      serialNumber: 'FEK3224R1AG',
      suspendingDeployTime: '',
      switchMac: 'c0:c5:20:aa:32:78',
      switchName: 'ICX7150-C12 Router',
      switchType: 'router',
      syncDataEndTime: '',
      syncDataId: '',
      syncedAdminPassword: false,
      syncedSwitchConfig: true,
      uptime: '7 days, 0 hours',
      venueId: '81e0fac39cee430992e9f770fce3645b',
      venueName: 'My-Venue'
    }
  ]
}

const stackMemberList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      venueName: 'test',
      serialNumber: 'FEK4224R19X',
      operStatusFound: false,
      switchMac: '',
      model: 'ICX7150-C12P',
      activeSerial: 'FEK4224R19X',
      id: 'FEK4224R19X',
      uptime: '',
      order: '1'
    },
    {
      venueName: 'test',
      serialNumber: 'stack-member',
      operStatusFound: false,
      switchMac: '',
      activeSerial: 'FEK4224R18X',
      id: 'FEK4224R18X',
      uptime: '',
      order: '2'
    }
  ]
}

const newStackMemberList = {
  totalCount: 2,
  page: 1,
  data: [{
    activeSerial: 'FEK4224R19X',
    members: [{
      venueName: 'test',
      serialNumber: 'FEK4224R19X',
      operStatusFound: false,
      switchMac: '',
      model: 'ICX7150-C12P',
      activeSerial: 'FEK4224R19X',
      id: 'FEK4224R19X',
      uptime: '',
      order: '1'
    }, {
      venueName: 'test',
      serialNumber: 'stack-member',
      operStatusFound: false,
      switchMac: '',
      activeSerial: 'FEK4224R18X',
      id: 'FEK4224R18X',
      uptime: '',
      order: '2'
    }]
  }]
}

export const mockVenueOptions = {
  fields: ['name', 'country', 'latitude', 'longitude', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'mock_venue_1',
      name: 'Mock Venue 1',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908'
    },
    {
      id: 'mock_venue_2',
      name: 'Mock Venue 2',
      country: 'United States',
      latitude: '38.4112751',
      longitude: '-123.0191908'
    },
    {
      id: 'mock_venue_3',
      name: 'Mock Venue 3',
      country: 'United States',
      latitude: '39.4112751',
      longitude: '-124.0191908'
    }
  ]
}

const mockedSyncReq = jest.fn()
const mockedRetryReq = jest.fn()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const FormComponent = ({ children }: React.PropsWithChildren) => {
  return <Form>{children}</Form>
}

type MockDrawerProps = React.PropsWithChildren<{
  visible: boolean
  importRequest: () => void
  onClose: () => void
}>
jest.mock('../ImportFileDrawer', () => ({
  ...jest.requireActual('../ImportFileDrawer'),
  ImportFileDrawer: ({ importRequest, onClose, visible, children }: MockDrawerProps) =>
    visible && <div data-testid={'ImportFileDrawer'}>
      <FormComponent>{children}</FormComponent>
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

jest.mock('../SwitchCliSession', () => ({
  SwitchCliSession: ({ modalState }: { modalState: boolean }) =>
    modalState && <div data-testid='SwitchCliSession'></div>
}))

describe('SwitchTable', () => {
  afterEach(() => {
    mockedUsedNavigate.mockClear()
    mockedSyncReq.mockClear()
    mockedRetryReq.mockClear()
    cleanup()
  })
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json(switchList))
      ),
      rest.post(
        SwitchUrlsInfo.getMemberList.url,
        (req, res, ctx) => res(ctx.json(stackMemberList))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchMemberList.url,
        (req, res, ctx) => res(ctx.json(newStackMemberList))
      ),
      rest.post(
        SwitchUrlsInfo.syncSwitchesData.url,
        (req, res, ctx) => {
          mockedSyncReq()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        SwitchUrlsInfo.retryFirmwareUpdate.url,
        (req, res, ctx) => {
          mockedRetryReq()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        SwitchUrlsInfo.getJwtToken.url,
        (_, res, ctx) => res(ctx.json({
          access_token: 'access_token',
          expires_in: '604800',
          id_token: 'id_token',
          type: 'JWT'
        }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [switchList?.data?.[1]]
        }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.importSwitches.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ ...mockVenueOptions }))
      )
    )
  })
  const params = {
    tenantId: 'tenant-Id',
    venueId: 'venue-Id'
  }

  it('should render correctly', async () => {
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(switchList.data.length)

    for (const [index, item] of Object.entries(switchList.data)) {
      expect(await within(rows[Number(index)]).findByText(item.model)).toBeVisible()
    }

    const switchRow = within(rows[0]).getAllByRole('cell', { name: /FEK4224R19X/i })
    expect(switchRow[0]).toBeVisible()

    expect(await within(rows[0]).findByRole('button', { expanded: false })).toBeVisible()
    await userEvent.click(await within(rows[0]).findByRole('button'))
    // TODO: check
    // await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await within(rows[0]).findByRole('button', { expanded: true })).toBeVisible()
    expect(await within(tbody).findByText('stack-member (Member)')).toBeVisible()
  })

  it(`should disable Match Admin Password button
    when switch firmware does not support Admin Password feature`, async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: switchList.data.slice(3, 4)
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await within(table).findByText(/1 selected/)
    const matchButton = await within(table)
      .findByRole('button', { name: 'Match Admin Password to Venue' })
    expect(matchButton).toBeVisible()
    expect(matchButton).toBeDisabled()
  })

  it('should render correctly when feature flag is on', async () => {
    const switchData = switchList.data.slice(3, 4)?.[0]
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [{
            ...switchData,
            firmware: 'SPR09010j_cd1'
          }]
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await within(table).findByText(/1 selected/)
    const matchButton = await within(table)
      .findByRole('button', { name: 'Match Admin Password to Venue' })
    expect(matchButton).toBeVisible()
    expect(matchButton).not.toBeDisabled()
  })

  it('should clicks add switch correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [switchList?.data?.[1]]
        }))
      )
    )

    render(<Provider><SwitchTable showAllColumns={true} enableActions={true} /></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    await screen.findByRole('row', { name: /FMF2249Q0JT/i })

    expect(await screen.findByText('Add Switch')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Switch' }))
    expect(mockedUsedNavigate).toBeCalledWith('/tenant-Id/t/devices/switch/add')
  })

  it('should clicks Import correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [switchList?.data?.[1]]
        }))
      ),
      rest.post(
        SwitchUrlsInfo.importSwitches.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} enableActions={true} /></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    expect(await screen.findByText('Import from file')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Import from file' }))

    const drawer = await screen.findByTestId('ImportFileDrawer')
    expect(drawer).toBeVisible()
    await userEvent.click(await within(drawer).findByRole('button', { name: 'Import' }))

    await waitFor(() => expect(drawer).not.toBeVisible())
  })
  it('should clicks Import with selected venue for RBAC correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchRbacUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [switchList?.data?.[1]]
        }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.importSwitches.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} enableActions={true} /></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    expect(await screen.findByText('Import from file')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Import from file' }))

    const drawer = await screen.findByTestId('ImportFileDrawer')
    expect(drawer).toBeVisible()

    expect(await within(drawer).findByRole('combobox', { name: 'Venue' })).toBeInTheDocument()
  })

  it('should clicks add stack correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [switchList?.data?.[1]]
        }))
      )
    )

    render(<Provider><SwitchTable showAllColumns={true} enableActions={true} /></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    await screen.findByRole('row', { name: /FMF2249Q0JT/i })

    expect(await screen.findByText('Add Stack')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Stack' }))
    expect(mockedUsedNavigate).toBeCalledWith('/tenant-Id/t/devices/switch/stack/add')
  })

  it('Table action bar Delete', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    render(<Provider><SwitchTable/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const deleteSpy = jest.fn()
    deleteSpy.mockReturnValueOnce(true)

    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteSwitches.url,
        (req, res, ctx) => deleteSpy() && res(ctx.json({ requestId: '456' }))
      )
    )

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('row')
    expect(within(rows[0]).getByRole('cell', { name: 'FEK4224R19X' })).toBeVisible() // select ap 1: operational
    await userEvent.click(rows[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    await userEvent.click(rows[0]) // unselect ap 1
    expect(await within(rows[0]).findByRole('checkbox')).not.toBeChecked()

    expect(within(rows[1]).getByRole('cell', { name: /FMF2249Q0JT/i })).toBeVisible()
    await userEvent.click(rows[1]) // select ap 2: DisconnectedFromCloud

    const checkboxes = await within(tbody).findAllByRole('checkbox', { checked: true })
    expect(checkboxes).toHaveLength(1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog2 = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog2).findByRole('button', { name: 'Delete Switch' }))

    expect(deleteSpy).toHaveBeenCalled()
    await waitFor(async () => expect(dialog2).not.toBeVisible())

  }, 60000)

  it('should redirect to edit switch page correctly', async () => {
    const switchData = switchList.data.slice(3, 4)?.[0]
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [switchData]
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await within(table).findByText(/1 selected/)
    await userEvent.click(
      await within(table).findByRole('button', { name: 'Edit' })
    )
    expect(mockedUsedNavigate).toBeCalledWith(
      // eslint-disable-next-line max-len
      `/tenant-Id/t/devices/switch/${switchData.id}/${switchData.serialNumber}/edit`, { replace: false })
  })

  it('should redirect to edit stack page correctly', async () => {
    const switchData = switchList.data.slice(3, 4)?.[0]
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [{
            ...switchData,
            isStack: true
          }]
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await within(table).findByText(/1 selected/)
    await userEvent.click(
      await within(table).findByRole('button', { name: 'Edit' })
    )
    expect(mockedUsedNavigate).toBeCalledWith(
      // eslint-disable-next-line max-len
      `/tenant-Id/t/devices/switch/${switchData.id}/${switchData.serialNumber}/stack/edit`, { replace: false })
  })

  it('should open CLI session modal correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: switchList.data.slice(3, 4)
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await within(table).findByText(/1 selected/)
    const cliButton = await within(table)
      .findByRole('button', { name: 'CLI Session' })
    expect(cliButton).toBeVisible()
    expect(cliButton).not.toBeDisabled()

    await userEvent.click(cliButton)
    expect(await screen.findByTestId('SwitchCliSession')).toBeVisible()
  })

  it('should sync password with venue correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [
            switchList.data[2],
            {
              ...switchList.data[3],
              firmware: 'SPR09010j_cd1'
            }
          ]
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const rows = await within(table).findAllByRole('row')
    await userEvent.click(await within(rows[1]).findByRole('checkbox'))
    await userEvent.click(await within(rows[2]).findByRole('checkbox'))

    const matchButton = await within(table)
      .findByRole('button', { name: 'Match Admin Password to Venue' })
    await within(table).findByText(/2 selected/)
    expect(matchButton).not.toBeDisabled()

    await userEvent.click(matchButton)
    await screen.findByText(/The switch admin password will be set same as the venue setting/)

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Match Password' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    expect(mockedSyncReq).toBeCalledTimes(1)
    await waitFor(async () =>
      expect(await screen.findByText(/Start admin password sync/)).toBeVisible()
    )

  })

  it('should retry firmware update correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({
          ...switchList,
          data: [{
            ...(switchList.data.slice(3, 4)?.[0]),
            deviceStatus: 'FIRMWARE_UPD_FAIL'
          }]
        }))
      )
    )
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const table = await screen.findByTestId('switch-table')
    const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await within(table).findByText(/1 selected/)
    const retryButton = await within(table)
      .findByRole('button', { name: 'Retry firmware update' })
    expect(retryButton).toBeVisible()

    await userEvent.click(retryButton)
    expect(mockedRetryReq).toBeCalledTimes(1)
    await waitFor(async () =>
      expect(await screen.findByText(/Start firmware upgrade retry/)).toBeVisible()
    )
  })

  it('should search correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const input = await screen.findByPlaceholderText('Search Switch, Model,' +
      ' Serial Number, MAC Address, IP Address, Ext. IP Address')

    expect(input).toBeVisible()
  })

  it.skip('should render with filterables', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchListByGroup.url,
        (req, res, ctx) => res(ctx.json({
          data: [{
            clients: 0,
            model: 'ICX7150-C12P',
            incidents: 0,
            members: 1,
            switches: [switchList.data[0]]
          }, {
            clients: 0,
            model: 'ICX7150-C08P',
            incidents: 0,
            members: 1,
            switches: [switchList.data[1]]
          }]
        }))
      )
    )
    render(<Provider><SwitchTable filterableKeys={{
      venueId: [],
      model: []
    }}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const tbody = await findTBody()
    expect(tbody).toBeVisible()

    const combos = await screen.findAllByRole('combobox')
    expect(combos).toHaveLength(5)

    await userEvent.click(combos[4])
    await userEvent.click(await screen.findByTitle('Model'))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findAllByText(/Members: 1/i)).toHaveLength(2)
  })

  describe('should render correctly when abac is enabled', () => {
    it('has permission', async () => {
      setUserProfile({
        ...getUserProfile(),
        abacEnabled: true,
        isCustomRole: true,
        scopes: [SwitchScopes.READ, SwitchScopes.UPDATE]
      })

      mockServer.use(
        rest.post(
          SwitchUrlsInfo.getSwitchList.url,
          (req, res, ctx) => res(ctx.json({
            ...switchList,
            data: switchList.data.slice(3, 4)
          }))
        )
      )
      render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
        route: { params, path: '/:tenantId/t' }
      })

      const table = await screen.findByTestId('switch-table')
      const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
      await userEvent.click(await within(row).findByRole('checkbox'))

      await within(table).findByText(/1 selected/)
      expect(await within(table).findByRole('button', { name: 'Edit' })).toBeVisible()
      expect(within(table).queryByRole('button', { name: 'Delete' })).toBeNull()
    })

    it('has no permission', async () => {
      setUserProfile({
        ...getUserProfile(),
        abacEnabled: true,
        isCustomRole: true,
        scopes: []
      })

      mockServer.use(
        rest.post(
          SwitchUrlsInfo.getSwitchList.url,
          (req, res, ctx) => res(ctx.json({
            ...switchList,
            data: switchList.data.slice(3, 4)
          }))
        )
      )
      render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
        route: { params, path: '/:tenantId/t' }
      })

      const table = await screen.findByTestId('switch-table')
      const row = await within(table).findByRole('row', { name: /FEK3224R1AG/i })
      expect(within(row).queryByRole('checkbox')).toBeNull()
    })
  })
})
