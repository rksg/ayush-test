import { rest } from 'msw'

import { switchApi }                                                        from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { switchDetailData } from './__tests__/fixtures'

import { SwitchOverviewTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailData))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })

    expect(screen.getAllByRole('tab')).toHaveLength(5)
    fireEvent.click(await screen.findByRole('tab', { name: 'Ports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/ports`,
      hash: '',
      search: ''
    })
  })

  it('should navigate to ports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'ports'
    }
    const { asFragment } = render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to Route Interfaces tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'routeInterfaces'
    }
    const { asFragment } = render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to VLANs tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'vlans'
    }
    const { asFragment } = render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to ACLs tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'acls'
    }
    const { asFragment } = render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})
