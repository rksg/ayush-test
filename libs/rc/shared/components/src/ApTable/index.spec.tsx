import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { apApi, venueApi, networkApi }  from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  act,
  cleanup,
  findTBody,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import {
  apList,
  apCompatibilities,
  getApGroupsList
} from './__test__/fixtures'

import { ApTable } from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const utils = require('@acx-ui/rc/utils')

jest.mock('../ApCompatibility', () => ({
  ...jest.requireActual('../ApCompatibility'),
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))
jest.mock('../Compatibility', () => ({
  ApGeneralCompatibilityDrawer: () => <div data-testid={'ApGeneralCompatibilityDrawer'} />
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

const mockFileSaver = jest.fn()
jest.mock('file-saver', () => (data: string, fileName: string) => {
  mockFileSaver(data, fileName)
})

describe('Aps', () => {
  afterEach(() => {
    mockedUsedNavigate.mockClear()
    cleanup()
  })
  beforeEach(() => {
    act(() => {
      store.dispatch(apApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      store.dispatch(networkApi.util.resetApiState())
    })

    utils.usePollingTableQuery = jest.fn().mockImplementation(() => {
      return { data: apList }
    })
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apList))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (req, res, ctx) => res(ctx.json(apCompatibilities))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => res(ctx.json(apCompatibilities))
      ),
      rest.get(WifiUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApGroupsListByGroup.url,
        (req, res, ctx) => res(ctx.json(getApGroupsList))
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
    expect(rows).toHaveLength(apList.data.length)
    for (const [index, item] of Object.entries(apList.data)) {
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
    await waitFor(() =>
      expect(mockFileSaver)
        .toHaveBeenCalledWith(fakeDownloadUrl, expect.stringContaining('SupportLog_'))
    )
    expect(await screen.findByText('Log is ready.', { exact: false })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Reboot' }))
    const rebootDialog = await waitFor(async () => screen.findByRole('dialog'))
    await userEvent.click(await within(rebootDialog).findByRole('button', { name: 'Reboot' }))
    expect(rebootSpy).toHaveBeenCalled()
    await waitFor(async () => expect(rebootDialog).not.toBeVisible())
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

    const apRows = await screen.findAllByRole('row', { name: /mock-ap-/i })
    expect(within(apRows[0]).getByRole('cell', { name: /mock-ap-1/i })).toBeVisible()
    await userEvent.click(apRows[0]) // select ap 1: operational

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('button', { name: 'Delete' })).toBeDisabled()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    await userEvent.click(apRows[0]) // unselect ap 1
    expect(await within(apRows[0]).findByRole('checkbox')).not.toBeChecked()

    expect(within(apRows[1]).getByRole('cell', { name: /mock-ap-2/i })).toBeVisible()
    await userEvent.click(apRows[1]) // select ap 2: DisconnectedFromCloud

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('checkbox', { checked: true })
    expect(rows).toHaveLength(1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog2 = await screen.findByRole('dialog')
    const dialog2DeleteButton = await within(dialog2).findByRole('button', { name: 'Delete' })
    expect(dialog2DeleteButton).not.toBeDisabled()

    await userEvent.click(dialog2DeleteButton)

    expect(deleteSpy).toHaveBeenCalled()
    await waitFor(async () => expect(dialog2).not.toBeVisible())
  })

  it('Table action bar Edit', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.EXPORT_DEVICE) ? true : false
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

    await userEvent.click(row)

    const toolbar = await screen.findByRole('alert')
    await userEvent.click(await within(toolbar).findByRole('button', { name: 'Edit' }))

    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it.skip('should render with filterables', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApGroupsListByGroup.url,
        (req, res, ctx) => res(ctx.json(getApGroupsList))
      )
    )
    render(<Provider><ApTable filterables={{
      venueId: [],
      deviceGroupId: []
    }}/></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const row1 = await within(tbody).findByRole('row', { name: /10.00.000.101/i })

    const combos = await screen.findAllByRole('combobox')
    expect(combos).toHaveLength(4)

    await userEvent.click(combos[3])
    await userEvent.click(await screen.findByTitle('AP Group'))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(row1).not.toBeVisible()
    expect(await screen.findByText(/Ungrouped APs/i)).toBeVisible()
  })

  it('should import correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

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
    await waitFor(() => expect(drawer).toBeVisible())
  })

  it.skip('Should render the low power warning messages', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><ApTable /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // screen.debug(undefined, 300000)
    expect(
      screen.getByText('Degraded - AP in low power mode', { exact: false })
    ).toBeInTheDocument()

    expect(
      screen.getByText('(Geo Location not set)', { exact: false })
    ).toBeInTheDocument()
  })
})
