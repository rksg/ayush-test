import '@testing-library/jest-dom'

import { SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import { render }           from '@acx-ui/test-utils'

import { breakoutPorts } from '../__tests__/fixtures'

import { FrontViewBreakoutPort }       from './FrontViewBreakoutPort'
import { FrontViewBreakoutPortDrawer } from './FrontViewBreakoutPortDrawer'


describe('FrontViewBreakoutPort', () => {
  const params = {
    tenantId: 'tenantId',
    switchId: 'switchId',
    serialNumber: 'serialNumber',
    activeTab: 'overview'
  }
  // it('should render front view slotcorrectly', async () => {

  //   render(<Provider>
  //     <FrontViewSlot
  //       slot={}
  //       key={'1/2/1'}
  //       isOnline={true}
  //       isStack={false}
  //       deviceStatus={SwitchStatusEnum.OPERATIONAL}
  //       portLabel=''
  //     />
  //   </Provider>, {
  //     route: {
  //       params,
  //       path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
  //     }
  //   })
  // })

  it('should render breakout port correctly', async () => {

    render(<Provider>
      <FrontViewBreakoutPort
        key={'1/2/1'}
        ports={breakoutPorts}
        deviceStatus={SwitchStatusEnum.OPERATIONAL}
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
  })

  it('should render breakout port drawer correctly', async () => {
    const mockDrawerVisible = jest.fn()
    render(<Provider>
      <FrontViewBreakoutPortDrawer
        portNumber={'1/2/1'}
        setDrawerVisible={mockDrawerVisible}
        drawerVisible={true}
        breakoutPorts={breakoutPorts.filter(p=>p.portIdentifier.includes(':'))}
      />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/panel'
      }
    })
  })






})
