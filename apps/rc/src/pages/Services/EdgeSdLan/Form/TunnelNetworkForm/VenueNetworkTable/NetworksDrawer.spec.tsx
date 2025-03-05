/* eslint-disable max-len */
import {
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { networkApi }                           from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, VlanPoolRbacUrls } from '@acx-ui/rc/utils'
import { Provider, store }                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockNetworkViewmodelList } from '../../../__tests__/fixtures'

import { NetworksDrawer, NetworksDrawerProps } from './NetworksDrawer'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue('ecc2d7cf9d2342fdb31ae0e24958fcac')
}))

const mockedSetFieldValue = jest.fn()
const mockedGetNetworkViewmodelList = jest.fn()
const mockedCloseFn = jest.fn()
const mockedSubmitFn = jest.fn()
const mockedVenueId = 'mocked_venue_id'
const { click } = userEvent

const MockedTargetComponent = (props: { initData?: Partial<NetworksDrawerProps> }) => {
  const { initData } = props
  return <Provider>
    <NetworksDrawer
      visible={true}
      onClose={mockedCloseFn}
      onSubmit={mockedSubmitFn}
      venueId={mockedVenueId}
      isGuestTunnelEnabled={false}
      {...initData}
    />
  </Provider>
}

describe('Network Drawer', () => {

  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedGetNetworkViewmodelList.mockReset()

    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_req, res, ctx) => res(ctx.json({
          data: mockNetworkViewmodelList,
          page: 0,
          totalCount: mockNetworkViewmodelList.length
        }))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_req, res, ctx) => {
          mockedGetNetworkViewmodelList()
          return res(ctx.json({
            fields: [
            ],
            totalCount: 0,
            page: 1,
            data: []
          }))
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })
    await basicCheck(false)
  })

  it('should correctly render grey out network when the network is used by PIN', async () => {
    render(<MockedTargetComponent
      initData={{
        pinNetworkIds: ['network_1', 'network_2']
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck(false)

    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[1]).getByRole('switch')
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    const switchBtn2 = within(rows[1]).getByRole('switch')
    expect(switchBtn).toBeDisabled()
    expect(switchBtn2).toBeDisabled()
  })

  it('should correctly render in edit mode', async () => {
    render(<MockedTargetComponent
      initData={{
        tunneledNetworks: {
          [mockedVenueId]: [
            { id: 'network_1', name: 'MockedNetwork 1' },
            { id: 'network_2', name: 'MockedNetwork 2' }
          ] }
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck(false)

    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[1]).getByRole('switch')
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    const switchBtn2 = within(rows[1]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    expect(switchBtn2).toBeChecked()
  })

  it('should correctly activate by switcher', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck(false)
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    await click(within(rows[1]).getByRole('switch'))

    await click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith({
      activatedNetworks: { [mockedVenueId]: [
        { name: 'MockedNetwork 2', id: 'network_2' }
      ] },
      activatedGuestNetworks: {}
    })
  })

  it('should correctly deactivate by switch', async () => {
    render(<MockedTargetComponent
      initData={{
        tunneledNetworks: { [mockedVenueId]: [
          { name: 'MockedNetwork 1', id: 'network_1' },
          { name: 'MockedNetwork 2', id: 'network_2' }
        ] }
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck(false)
    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[0]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await click(switchBtn)
    await click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith({
      activatedNetworks: { [mockedVenueId]: [
        { name: 'MockedNetwork 2', id: 'network_2' }
      ] },
      activatedGuestNetworks: {}
    })
  })

  it('activatedNetworks will be default into {} when networks is not touched in create mode', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck(false)
    await click(await screen.findByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith({
      activatedNetworks: {},
      activatedGuestNetworks: {}
    })
  })

  describe('guest tunnel enabled', () => {
    it('should correctly display', async () => {
      render(<MockedTargetComponent
        initData={{
          isGuestTunnelEnabled: true,
          tunneledNetworks: { [mockedVenueId]: [
            { name: 'MockedNetwork 1', id: 'network_1' },
            { name: 'MockedNetwork 4', id: 'network_4' }
          ] },
          tunneledGuestNetworks: { [mockedVenueId]: [
            { name: 'MockedNetwork 4', id: 'network_4' }
          ] }
        }}
      />, { route: { params: { tenantId: 't-id' } } })

      const rows = await basicCheck(true)

      expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
      const switchBtns = within(rows[0]).getAllByRole('switch')
      expect(switchBtns.length).toBe(1)
      expect(switchBtns[0]).toBeChecked()

      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const captivePortalSwitchBtns = within(rows[3]).getAllByRole('switch')
      expect(captivePortalSwitchBtns.length).toBe(2)
      captivePortalSwitchBtns.forEach(item => {
        expect(item).toBeChecked()
      })
    })

    it('guest tunnel network should default true when is captivePortal network', async () => {
      render(<MockedTargetComponent
        initData={{
          isGuestTunnelEnabled: true
        }}
      />, { route: { params: { tenantId: 't-id' } } })

      const rows = await basicCheck(true)

      // when turn on DC captive portal network DMZ network should be ON by default
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      switchBtns.forEach((switchBtn) => {
        expect(switchBtn).not.toBeChecked()
      })
      await click(switchBtns[0])
      await click(screen.getByRole('button', { name: 'OK' }))
      expect(mockedSubmitFn).toBeCalledWith({
        activatedNetworks: { [mockedVenueId]: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ] },
        activatedGuestNetworks: { [mockedVenueId]: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ] }
      })
    })

    it('data network should be true when enable guest captivePortal network', async () => {
      render(<MockedTargetComponent
        initData={{
          isGuestTunnelEnabled: true
        }}
      />, { route: { params: { tenantId: 't-id' } } })

      const rows = await basicCheck(true)
      // when turn on DC captive portal network DMZ network should be ON by default
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      switchBtns.forEach((switchBtn) => {
        expect(switchBtn).not.toBeChecked()
      })
      await click(switchBtns[1])
      await click(screen.getByRole('button', { name: 'OK' }))
      expect(mockedSubmitFn).toBeCalledWith({
        activatedNetworks: { [mockedVenueId]: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ] },
        activatedGuestNetworks: { [mockedVenueId]: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ] }
      })
    })

    it('should be able to deactivate guest then deactivate dc tunnel', async () => {
      render(<MockedTargetComponent
        initData={{
          isGuestTunnelEnabled: true,
          tunneledNetworks: { [mockedVenueId]: [
            { name: 'MockedNetwork 4', id: 'network_4' }
          ] },
          tunneledGuestNetworks: { [mockedVenueId]: [
            { name: 'MockedNetwork 4', id: 'network_4' }
          ] }
        }}
      />, { route: { params: { tenantId: 't-id' } } })

      const rows = await basicCheck(true)
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      // should all activated
      switchBtns.forEach((switchBtn) => expect(switchBtn).toBeChecked())

      // deactivate guest tunnel
      await click(switchBtns[1])
      // deactivate dc tunnel
      await click(switchBtns[0])

      // should all deactivated
      switchBtns.forEach((switchBtn) => expect(switchBtn).not.toBeChecked())

      await click(screen.getByRole('button', { name: 'OK' }))
      expect(mockedSubmitFn).toBeCalledWith({
        activatedNetworks: {},
        activatedGuestNetworks: {}
      })
    })

    it('should not check conflict when deactivate dc tunnel on guest forwarded network', async () => {
      const mockedNetwork4 = { name: 'MockedNetwork 4', id: 'network_4' }

      render(<MockedTargetComponent
        initData={{
          isGuestTunnelEnabled: true,
          tunneledNetworks: {
            [mockedVenueId]: [mockedNetwork4],
            other_venue_id: [mockedNetwork4]
          },
          tunneledGuestNetworks: {
            [mockedVenueId]: [mockedNetwork4],
            other_venue_id: [mockedNetwork4]
          }
        }}
      />, { route: { params: { tenantId: 't-id' } } })

      const rows = await basicCheck(true)
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      // should all activated
      switchBtns.forEach((switchBtn) => expect(switchBtn).toBeChecked())

      // deactivate dc tunnel
      await click(switchBtns[0])
      expect(screen.queryByText(/setting must be consistent across all venues/)).toBeNull()
      switchBtns.forEach((switchBtn) => expect(switchBtn).not.toBeChecked())
    })

    it('should popup conflict when activate guest forward network', async () => {
      const mockedNetwork4 = { name: 'MockedNetwork 4', id: 'network_4' }

      render(<MockedTargetComponent
        initData={{
          isGuestTunnelEnabled: true,
          tunneledNetworks: {
            [mockedVenueId]: [mockedNetwork4],
            other_venue_id: [mockedNetwork4],
            other_venue_id2: [mockedNetwork4],
            other_venue_id3: [mockedNetwork4]
          }
        }}
      />, { route: { params: { tenantId: 't-id' } } })

      const rows = await basicCheck(true)
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      // dc tunneling activated
      expect(switchBtns[0]).toBeChecked()
      expect(switchBtns[1]).not.toBeChecked()

      // activate dmz tunnel
      await click(switchBtns[1])
      await screen.findByText(/setting must be consistent across all venues/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      await click(screen.getByRole('button', { name: 'OK' }))
      expect(mockedSubmitFn).toBeCalledWith({
        activatedNetworks: {
          [mockedVenueId]: [mockedNetwork4],
          other_venue_id: [mockedNetwork4],
          other_venue_id2: [mockedNetwork4],
          other_venue_id3: [mockedNetwork4]
        },
        activatedGuestNetworks: {
          [mockedVenueId]: [mockedNetwork4],
          other_venue_id: [mockedNetwork4],
          other_venue_id2: [mockedNetwork4],
          other_venue_id3: [mockedNetwork4]
        }
      })
    })
  })
})

const basicCheck = async (isDmz: boolean): Promise<HTMLElement[]> => {
  await waitFor(() => expect(mockedGetNetworkViewmodelList).toBeCalled())
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(7)

  if (isDmz)
    screen.getByRole('columnheader', { name: /Forward Guest Traffic to DM/ })

  return rows
}