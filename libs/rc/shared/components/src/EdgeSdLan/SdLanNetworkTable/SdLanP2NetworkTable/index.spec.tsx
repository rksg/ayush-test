import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import _                   from 'lodash'
import { rest }            from 'msw'

import { networkApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockNetworkSaveData, mockNetworkViewmodelList } from '../../__tests__/fixtures'

import { EdgeSdLanP2ActivatedNetworksTable } from '.'

const mockedSetFieldValue = jest.fn()
const mockedOnChangeFn = jest.fn()
const mockedGetNetworkViewmodelList = jest.fn()
const { click } = userEvent

jest.mock('../../../NetworkForm/AddNetworkModal', () => ({
  ...jest.requireActual('../../../NetworkForm/AddNetworkModal'),
  AddNetworkModal: () => <div data-testid='AddNetworkModal' />
}))

describe('Edge SD-LAN ActivatedNetworksTable', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedGetNetworkViewmodelList.mockReset()
    mockedOnChangeFn.mockReset()
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (_req, res, ctx) => {
          mockedGetNetworkViewmodelList()
          return res(ctx.json({
            data: mockNetworkViewmodelList,
            page: 0,
            totalCount: mockNetworkViewmodelList.length
          }))
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
        nwSubType: NetworkTypeEnum.OPEN
      },
      false,
      ['network_2'])
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
        nwSubType: NetworkTypeEnum.PSK
      },
      true,
      ['network_2'])
  })

  it('can change column header title by props', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
          columnsSetting={[
            { key: 'name', title: 'Test Title' },
            { key: 'unkownField', title: 'Change non-existent field' }
          ]}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    const rows = await checkPageLoaded()
    await screen.findByRole('columnheader', { name: /Test Title/i })
    expect(screen.queryByRole('columnheader', { name: /Change non-existent field/i })).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Active Network' })).toBeNull()
    rows.forEach(row => {
      expect(within(row).getByRole('switch')).not.toBeChecked()
    })
  })

  it('should popup add network modal', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    await userEvent.click(screen.getByRole('button', { name: 'Add Wi-Fi Network' }))
    expect(screen.queryByTestId('AddNetworkModal')).toBeVisible()
  })
  it('should grey out OWE transition network', async () => {
    render(
      <Provider>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId='mocked-venue'
          isGuestTunnelEnabled={false}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    const switchBtn = within(await screen.findByRole('row', { name: /MockedNetwork 6/i }))
      .getByRole('switch')
    expect(switchBtn).toBeDisabled()
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

    it('should correctly display when guest network is undefined', async () => {
      render(
        <Provider>
          <EdgeSdLanP2ActivatedNetworksTable
            venueId='mocked-venue-2'
            isGuestTunnelEnabled={true}
            activated={['network_2', 'network_3']}
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
          nwSubType: NetworkTypeEnum.CAPTIVEPORTAL
        },
        false,
        [])
    })

    it('should grey out vlan pooling network tunnel to DMZ', async () => {
      const withVlanPoolEnabled = _.cloneDeep(mockNetworkViewmodelList)
      withVlanPoolEnabled.forEach((item) => {
        if (item.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL) {
          item.vlanPool = {
            name: ''
          }
        }
      })

      mockServer.use(
        rest.post(
          CommonUrlsInfo.getVenueNetworkList.url,
          (_req, res, ctx) => {
            mockedGetNetworkViewmodelList()
            return res(ctx.json({
              data: withVlanPoolEnabled,
              page: 0,
              totalCount: withVlanPoolEnabled.length
            }))
          }
        )
      )

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
      expect(switchBtns[1]).toBeDisabled()
    })
  })
})

const checkPageLoaded = async (): Promise<HTMLElement[]> => {
  await waitFor(() => expect(mockedGetNetworkViewmodelList).toBeCalled())
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(7)
  return rows
}