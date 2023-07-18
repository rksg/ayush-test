import userEvent from '@testing-library/user-event'

import { SwitchSlot, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { render , screen }              from '@acx-ui/test-utils'

import { breakoutPorts } from '../__tests__/fixtures'

import { FrontViewBreakoutPort }       from './FrontViewBreakoutPort'
import { FrontViewBreakoutPortDrawer } from './FrontViewBreakoutPortDrawer'
import { FrontViewSlot }               from './FrontViewSlot'
import { panelContext }                from './index.spec'

import { SwitchPanelContext } from '.'

describe('FrontViewBreakoutPort', () => {
  const params = {
    tenantId: 'tenantId',
    switchId: 'switchId',
    serialNumber: 'serialNumber',
    activeTab: 'overview'
  }
  it('should render front view slotcorrectly', async () => {
    const slotData = {
      fanStatus: {},
      portCount: 11,
      portStatus: breakoutPorts,
      powerStatus: {}
    } as SwitchSlot
    render(<Provider>
      <FrontViewSlot
        slot={slotData}
        key={'1/2/1'}
        isOnline={true}
        isStack={false}
        deviceStatus={SwitchStatusEnum.OPERATIONAL}
        portLabel=''
      />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
  })

  it('should render operational breakout port correctly', async () => {

    render(<Provider>
      <SwitchPanelContext.Provider value={panelContext}>
        <FrontViewBreakoutPort
          key={'1/2/1'}
          ports={breakoutPorts}
          deviceStatus={SwitchStatusEnum.OPERATIONAL}
          labelText={'1'}
          labelPosition='top'
          tooltipEnable={true}
          portData={breakoutPorts[0]}
        />
      </SwitchPanelContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('BreakoutPort')).toBeVisible()
    await userEvent.click(screen.getByTestId('BreakoutPort'))
  })

  it('should render disconnected breakout port correctly', async () => {

    render(<Provider>
      <FrontViewBreakoutPort
        key={'1/2/1'}
        ports={breakoutPorts}
        deviceStatus={SwitchStatusEnum.DISCONNECTED}
        labelText={'1'}
        labelPosition='top'
        tooltipEnable={true}
        portData={breakoutPorts[0]}
      />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('BreakoutPort')).toBeVisible()
  })

  it('should render bottom breakout port correctly', async () => {
    render(<Provider>
      <FrontViewBreakoutPort
        key={'1/2/1'}
        ports={breakoutPorts}
        deviceStatus={SwitchStatusEnum.OPERATIONAL}
        labelText={'1'}
        labelPosition='bottom'
        tooltipEnable={true}
        portData={breakoutPorts[0]}
      />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('BreakoutPort')).toBeVisible()
  })

  it('should render Up breakout port correctly', async () => {
    let breakoutPorts_up = breakoutPorts
    breakoutPorts_up[0].status='Up'

    render(<Provider>
      <FrontViewBreakoutPort
        key={'1/2/1'}
        ports={breakoutPorts_up}
        deviceStatus={SwitchStatusEnum.OPERATIONAL}
        labelText={'1'}
        labelPosition='bottom'
        tooltipEnable={true}
        portData={breakoutPorts[0]}
      />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('BreakoutPort')).toBeVisible()
  })

  it('should render Offline breakout port correctly', async () => {
    let breakoutPorts_up = breakoutPorts
    breakoutPorts_up[0].status='Offline'

    render(<Provider>
      <FrontViewBreakoutPort
        key={'1/2/1'}
        ports={breakoutPorts_up}
        deviceStatus={SwitchStatusEnum.OPERATIONAL}
        labelText={'1'}
        labelPosition='bottom'
        tooltipEnable={true}
        portData={breakoutPorts[0]}
      />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(screen.queryByTestId('BreakoutPort')).toBeVisible()
  })

  it('should render breakout port drawer correctly', async () => {
    const mockDrawerVisible = jest.fn()
    render(<Provider>
      <SwitchPanelContext.Provider value={panelContext}>
        <FrontViewBreakoutPortDrawer
          portNumber={'1/2/1'}
          setDrawerVisible={mockDrawerVisible}
          drawerVisible={true}
          breakoutPorts={breakoutPorts.filter(p=>p.portIdentifier.includes(':'))}
        />
      </SwitchPanelContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
    expect(await screen.findByRole('table')).toBeVisible()
    const row1 = await screen.findByRole('cell', { name: '1/2/1:1' })
    await userEvent.click(row1)
    const editButton = await screen.findByText('Edit')
    expect(editButton).toBeVisible()
  })
})
