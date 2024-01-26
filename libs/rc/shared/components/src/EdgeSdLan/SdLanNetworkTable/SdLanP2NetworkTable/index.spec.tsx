import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { rest }            from 'msw'

import { networkApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockNetworkSaveData, mockDeepNetworkList } from '../../__tests__/fixtures'

import { EdgeSdLanP2ActivatedNetworksTable } from '.'

const mockedSetFieldValue = jest.fn()
const mockedOnChangeFn = jest.fn()
const mockedGetNetworkDeepList = jest.fn()
const { click } = userEvent

describe('Edge SD-LAN ActivatedNetworksTable', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedGetNetworkDeepList.mockReset()
    mockedOnChangeFn.mockReset()
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (_req, res, ctx) => {
          mockedGetNetworkDeepList()
          return res(ctx.json(mockDeepNetworkList))
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
          onActivateChange={mockedOnChangeFn}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    const rows = await checkPageLoaded()
    rows.forEach(row => {
      expect(within(row).getByRole('switch')).not.toBeChecked()
    })
  })
  it('should correctly deactivate by switch', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
          activated={['network_2', 'network_3']}
          onActivateChange={mockedOnChangeFn}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    const switchBtn1 = within(await screen.findByRole('row', { name: /MockedNetwork 1/i }))
      .getByRole('switch')
    expect(switchBtn1).not.toBeChecked()
    const switchBtn3 = within(await screen.findByRole('row', { name: /MockedNetwork 3/i }))
      .getByRole('switch')
    expect(switchBtn3).toBeChecked()
    await click(switchBtn3)
    expect(mockedOnChangeFn).toBeCalledWith('activatedNetworks',
      {
        id: 'network_3',
        name: 'MockedNetwork 3',
        type: NetworkTypeEnum.OPEN
      },
      false,
      [{
        id: 'network_2',
        name: 'MockedNetwork 2',
        type: NetworkTypeEnum.PSK
      }])
  })
  it('should correctly activate by switcher', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
          onActivateChange={mockedOnChangeFn}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()

    await click(
      within(await screen.findByRole('row', { name: /MockedNetwork 2/i })).getByRole('switch'))
    expect(mockedOnChangeFn).toBeCalledWith('activatedNetworks',
      {
        id: 'network_2',
        name: 'MockedNetwork 2',
        type: NetworkTypeEnum.PSK
      },
      true,
      [{
        id: 'network_2',
        name: 'MockedNetwork 2',
        type: NetworkTypeEnum.PSK
      }])
  })

  it('can change column header title by props', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
          columnsSetting={[
            { key: 'name', title: 'Test Title' }
          ]}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    const rows = await checkPageLoaded()
    await screen.findByRole('columnheader', { name: /Test Title/i })
    expect(screen.queryByRole('columnheader', { name: 'Active Network' })).toBeNull()
    rows.forEach(row => {
      expect(within(row).getByRole('switch')).not.toBeChecked()
    })
  })

  describe('Guest tunnel enabled', () => {
    it('should correctly display', async () => {
      render(
        <Provider>
          <EdgeSdLanP2ActivatedNetworksTable
            venueId='mocked-venue-2'
            isGuestTunnelEnabled={true}
            activated={['network_2', 'network_3']}
            activatedGuest={['network_3']}
            onActivateChange={mockedOnChangeFn}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded()
      const nonGuestNetwork = await screen.findByRole('row', { name: /MockedNetwork 2/i })
      expect((await within(nonGuestNetwork).findAllByRole('switch')).length).toBe(1)

      const guestNetwork = await screen.findByRole('row', { name: /MockedNetwork 4/i })
      expect((await within(guestNetwork).findAllByRole('switch')).length).toBe(2)
    })

    it('should correctly deactivate guest traffic by switcher', async () => {
      render(
        <Provider>
          <EdgeSdLanP2ActivatedNetworksTable
            venueId='mocked-venue-2'
            isGuestTunnelEnabled={true}
            activated={['network_1', 'network_4']}
            activatedGuest={['network_4']}
            onActivateChange={mockedOnChangeFn}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded()
      await screen.findByRole('columnheader', { name: /Forward Guest Traffic to DMZ/i })

      const switchBtns = within(await screen.findByRole('row', { name: /MockedNetwork 4/i }))
        .getAllByRole('switch')
      await click(switchBtns[1])
      expect(mockedOnChangeFn).toBeCalledWith('activatedGuestNetworks',
        {
          id: 'network_4',
          name: 'MockedNetwork 4',
          type: NetworkTypeEnum.CAPTIVEPORTAL
        },
        false,
        [])
    })
  })
})

const checkPageLoaded = async (): Promise<HTMLElement[]> => {
  await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(4)
  return rows
}