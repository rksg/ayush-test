import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { switchApi }              from '@acx-ui/rc/services'
import { SwitchUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider, store }        from '@acx-ui/store'
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

jest.mock('../SwitchCliSession', () => ({
  SwitchCliSession: ({ modalState }: { modalState: boolean }) =>
    modalState && <div data-testid={'SwitchCliSession'}></div>
}))

describe('SwitchTable', () => {
  afterEach(() => {
    mockedUsedNavigate.mockClear()
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
      )
    )
  })
  const params = {
    tenantId: 'tenant-Id'
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

    const row1 = await screen.findByRole('row', { name: /FEK4224R19X/i })
    expect(await within(row1).findByRole('button', { expanded: false })).toBeVisible()
    await userEvent.click(await within(row1).findByRole('button'))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await within(row1).findByRole('button', { expanded: true })).toBeVisible()
    expect(await within(tbody).findByText('stack-member')).toBeVisible()
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
    mockedUsedNavigate.mockClear()

    const row = await screen.findByRole('row', { name: /FMF2249Q0JT/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    // eslint-disable-next-line max-len
    expect(mockedUsedNavigate).toBeCalledWith('/tenant-Id/t/devices/switch/FMF2249Q0JT/FMF2249Q0JT/edit', { replace: false })
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
    mockedUsedNavigate.mockClear()

    const row = await screen.findByRole('row', { name: /FMF2249Q0JT/i })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    // eslint-disable-next-line max-len
    expect(mockedUsedNavigate).toBeCalledWith('/tenant-Id/t/devices/switch/FMF2249Q0JT/FMF2249Q0JT/edit', { replace: false })
  })

  it('Table action bar Delete', async () => {
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

    const row1 = await screen.findByRole('row', { name: /FEK4224R19X/i }) // select ap 1: operational
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    await userEvent.click(row1) // unselect ap 1
    expect(await within(row1).findByRole('checkbox')).not.toBeChecked()

    const row2 = await screen.findByRole('row', { name: /FMF2249Q0JT/i })
    await userEvent.click(row2) // select ap 2: DisconnectedFromCloud

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('checkbox', { checked: true })
    expect(rows).toHaveLength(1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog2 = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog2).findByRole('button', { name: 'Delete Switch' }))

    expect(deleteSpy).toHaveBeenCalled()
    await waitFor(async () => expect(dialog2).not.toBeVisible())

  }, 60000)

  it('should search correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.EXPORT_DEVICE ? true : false
    })
    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId/t' }
    })

    const input = await screen
      .findByPlaceholderText('Search Switch, Model, Serial Number, MAC Address, IP Address')

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

    expect(await screen.findAllByText(/Members\: 1/i)).toHaveLength(2)
  })
})
