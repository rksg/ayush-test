import '@testing-library/jest-dom'
import userEvent     from '@testing-library/user-event'
import { message }   from 'antd'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { apApi }                  from '@acx-ui/rc/services'
import {
  APGeneralFixtures,
  CommonRbacUrlsInfo,
  DHCPUrls,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { dhcpApSetting, dhcpList, dhcpResponse, dummySwitchClientList } from './__tests__/fixtures'

import { useApActions } from '.'

const mockFileSaver = jest.fn()
jest.mock('file-saver', () => (data: string, fileName: string) => {
  mockFileSaver(data, fileName)
})

const serialNumber = ':serialNumber'
const tenantId = ':tenantId'
const venueId = ':venueId'

const { mockAPList } = APGeneralFixtures
const apList = cloneDeep(mockAPList)
apList.data.splice(1, 1)
apList.totalCount = apList.data.length
apList.data[0].firmwareVersion ='6.2.0.103.261' // invalid Ap Fw version for reset
apList.data[0].venueId = dhcpList.data[0].venueIds[0]
apList.data[0].serialNumber = dhcpApSetting.serialNumber

describe('Test useApActions', () => {

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API)
    message.destroy()
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apList))
      ),
      rest.post(
        WifiUrlsInfo.getDhcpAp.url,
        (req, res, ctx) => res(ctx.json([{
          venueDhcpEnabled: true
        }] ))
      ),
      rest.delete(
        WifiRbacUrlsInfo.deleteAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.patch(
        WifiRbacUrlsInfo.rebootAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.patch(
        WifiRbacUrlsInfo.blinkLedAp.url,
        (req, res, ctx) => res(ctx.json({ requestId: '789' }))
      ),
      rest.get(
        WifiRbacUrlsInfo.downloadApLog.url,
        (req, res, ctx) => res(ctx.json({ fileURL: '/abc.tar.gz', fileUrl: '/abc.tar.gz' }))
      )
    )
  })

  it('showDeleteAp', async () => {
    mockServer.use(
      rest.post(
        DHCPUrls.queryDhcpProfiles.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        WifiRbacUrlsInfo.getDhcpAps.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_req, res, ctx) => res(ctx.json(dummySwitchClientList))
      )
    )
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDeleteAp } = result.current
    const callback = jest.fn()

    act(() => {
      showDeleteAp(serialNumber, tenantId, callback)
    })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to delete')

    expect(dialog).toHaveTextContent('Once deleted, the AP will factory reset to Cloud ready')

    expect(dialog).toHaveTextContent('The AP\'s firmware does not support reset')

    const deleteBtn = within(dialog).getByRole('button', { name: 'Delete' })

    fireEvent.click(deleteBtn)

    await waitFor(async () => expect(callback).toBeCalled())

    expect(dialog).not.toBeVisible()

    jest.clearAllMocks()
  })

  it('showRebootAp', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showRebootAp } = result.current
    const callback = jest.fn()

    act(() => {
      showRebootAp(serialNumber, tenantId, venueId, callback)
    })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Rebooting the AP will disconnect all connected clients')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reboot' }))

    expect(callback).toBeCalled()
    await waitFor(async () => expect(dialog).not.toBeVisible())
  })

  it('showDownloadApLog', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDownloadApLog } = result.current
    const callback = jest.fn()

    act(() => {
      showDownloadApLog(serialNumber, tenantId, venueId, callback)
    })

    expect(await screen.findByTestId('toast-content')).toHaveTextContent('Preparing log')

    expect(await screen.findByText('Log is ready', { exact: false })).toBeVisible()

    expect(callback).toBeCalled()
  })

  it('showBlinkLedAp', async () => {
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showBlinkLedAp } = result.current

    act(() => {
      showBlinkLedAp(serialNumber, tenantId, venueId)
    })

    expect(await screen.findByTestId('toast-content')).toHaveTextContent('AP LEDs Blink')
  })

  it('should show warning when there is an active dhcp ap', async () => {
    mockServer.use(
      rest.post(
        DHCPUrls.queryDhcpProfiles.url,
        (req, res, ctx) => res(ctx.json(dhcpList))
      ),
      rest.post(
        WifiRbacUrlsInfo.getDhcpAps.url,
        (req, res, ctx) => res(ctx.json({ data: [dhcpApSetting] }))
      ),
      rest.get(
        DHCPUrls.getDHCProfileDetail.url,
        (req, res, ctx) => res(ctx.json(dhcpResponse))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_req, res, ctx) => res(ctx.json(dummySwitchClientList))
      )
    )
    const { result } = renderHook(() => useApActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { showDeleteAp } = result.current

    act(() => {
      showDeleteAp('000000000001', tenantId)
    })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Not allow to delete DHCP APs')
    const OKBtn = within(dialog).getByRole('button', { name: 'OK' })
    await userEvent.click(OKBtn)
    await waitFor(() => expect(dialog).not.toBeVisible())
    jest.clearAllMocks()
  })
})
