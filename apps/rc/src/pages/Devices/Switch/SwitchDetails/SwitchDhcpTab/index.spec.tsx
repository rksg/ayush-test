import '@testing-library/jest-dom'
import { rest } from 'msw'

import * as CommonComponent                               from '@acx-ui/components'
import { switchApi }                                      from '@acx-ui/rc/services'
import { IP_ADDRESS_TYPE, SwitchUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { switchDetailData } from '../__tests__/fixtures'

import { SwitchDhcpTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchDhcpTab', () => {
  const params = {
    tenantId: ':tenantId',
    switchId: ':switchId',
    serialNumber: ':serialNumber',
    activeTab: 'dhcp',
    activeSubTab: 'pool'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get( SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          dhcpClientEnabled: true,
          dhcpServerEnabled: false,
          ipAddressType: IP_ADDRESS_TYPE.DYNAMIC
        }))),
      rest.get( SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailData))),
      rest.post( SwitchUrlsInfo.getDhcpPools.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get( SwitchUrlsInfo.dhcpLeaseTable.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get( SwitchUrlsInfo.getDhcpLeases.url,
        (_, res, ctx) => res(ctx.json({ response: { syncing: false, result: '{}' } }))),
      rest.post(SwitchUrlsInfo.updateDhcpServerState.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><SwitchDhcpTab /></Provider>, {
      route: { params,
        path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const poolTab = await screen.findByRole('tab', { name: 'Pools' })
    expect(poolTab.getAttribute('aria-selected')).toBeTruthy()

    const leaseTab = await screen.findByRole('tab', { name: 'Leases' })
    fireEvent.click(leaseTab)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/dhcp/lease',
      hash: '',
      search: ''
    })
    const statusBtn = await screen.findByRole('switch')
    const mockedShowActionModal = jest.fn()
    jest.spyOn(CommonComponent, 'showActionModal').mockImplementation(
      mockedShowActionModal
    )

    await waitFor(() => expect(statusBtn).toBeEnabled())

    fireEvent.click(await screen.findByRole('switch'))
    expect(mockedShowActionModal).toBeCalledTimes(1)
    // await screen.findByRole('dialog')
    // expect(await screen.findByRole('dialog')).toHaveTextContent('Configure static IP address')
    // fireEvent.click(screen.getByRole('button', { name: 'OK' }))
  })

  it('should show confirm while clicking status button', async () => {
    mockServer.use(
      rest.get( SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({
          dhcpClientEnabled: false,
          dhcpServerEnabled: false,
          ipAddressType: IP_ADDRESS_TYPE.STATIC
        })))
    )

    render(<Provider><SwitchDhcpTab /></Provider>, {
      route: { params: { ...params, activeSubTab: 'lease' },
        path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const mockedShowActionModal = jest.fn()
    jest.spyOn(CommonComponent, 'showActionModal').mockImplementation(
      mockedShowActionModal
    )

    const statusBtn = screen.getByRole('switch')
    await waitFor(() => expect(statusBtn).toBeEnabled())

    fireEvent.click(screen.getByRole('switch'))
    expect(mockedShowActionModal).toBeCalledTimes(1)
    // await screen.findByRole('dialog')
    // expect(await screen.findByRole('dialog')).toHaveTextContent('DHCP server is enabled')
    // fireEvent.click(screen.getByRole('button', { name: 'OK' }))
  })
})