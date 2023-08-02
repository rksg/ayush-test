import userEvent from '@testing-library/user-event'

import { SwitchPortStatus } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import { render , screen }  from '@acx-ui/test-utils'

import { ports } from '../__tests__/fixtures'

import { FrontViewPort } from './FrontViewPort'
import { panelContext }  from './index.spec'

import { SwitchPanelContext } from '.'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetLagListQuery: () => [jest.fn().mockResolvedValue({
    data: [
      { lagId: 1, name: 'Lag 1' },
      { lagId: 2, name: 'Lag 2' }
    ]
  })
  ]
}))

describe('FrontViewPort', () => {
  const params = {
    tenantId: 'tenantId',
    switchId: 'switchId',
    serialNumber: 'serialNumber',
    activeTab: 'overview'
  }

  it('should render operational regular port correctly', async () => {
    render(<Provider>
      <SwitchPanelContext.Provider value={panelContext}>
        <FrontViewPort
          key={'1/5/1'}
          portColor='green'
          portIcon=''
          labelText={'5'}
          labelPosition='top'
          tooltipEnable={true}
          portData={ports[4] as unknown as SwitchPortStatus}
        />
      </SwitchPanelContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('RegularPort')).toBeVisible()
  })

  it('should render operational UpLink port correctly', async () => {
    const setEditPortDrawerVisible = jest.fn()
    const setSelectedPorts = jest.fn()
    const panelContextValue = {
      ...panelContext,
      setEditPortDrawerVisible,
      setSelectedPorts
    }
    render(<Provider>
      <SwitchPanelContext.Provider value={panelContextValue}>
        <FrontViewPort
          key={'1/6/1'}
          portColor='green'
          portIcon='UpLink'
          labelText={'6'}
          labelPosition='bottom'
          tooltipEnable={true}
          portData={ports[5] as unknown as SwitchPortStatus}
        />
      </SwitchPanelContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('RegularPortWithIcon')).toBeVisible()
    await userEvent.click(screen.getByTestId('RegularPortWithIcon'))
    expect(setEditPortDrawerVisible).toBeCalled()
    expect(setSelectedPorts).toBeCalled()
  })

  it('should render operational LAG port correctly', async () => {
    const setEditLagModalVisible = jest.fn()
    const setEditLag = jest.fn()
    const panelContextValue = {
      ...panelContext,
      setEditLagModalVisible,
      setEditLag
    }
    render(<Provider>
      <SwitchPanelContext.Provider value={panelContextValue}>
        <FrontViewPort
          key={'1/7/1'}
          portColor='green'
          portIcon='LagMember'
          labelText={'7'}
          labelPosition='top'
          tooltipEnable={true}
          portData={ports[6] as unknown as SwitchPortStatus}
        />
      </SwitchPanelContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('RegularPortWithIcon')).toBeVisible()
    await userEvent.click(screen.getByTestId('RegularPortWithIcon'))
    expect(setEditLagModalVisible).toBeCalled()
    expect(setEditLag).toBeCalled()
  })
})
