import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import {
  currentSwitchDevice,
  stackMembersData,
  switchDetailSwitchOnline
} from './__tests__/fixtures'

import { SwitchOverviewPanel } from '.'


jest.mock('@acx-ui/analytics/components', () => ({
  SwitchesTrafficByVolume: () =>
    <div data-testid={'rc-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  SwitchStatusByTime: () =>
    <div data-testid={'rc-SwitchStatusByTime'} title='SwitchStatusByTime' />
}))
jest.mock('./ResourceUtilization', () => ({
  ResourceUtilization: () =>
    <div data-testid={'rc-ResourceUtilization'} title='ResourceUtilization' />
}))
jest.mock('./TopPorts', () => ({
  TopPorts: () =>
    <div data-testid={'rc-TopPorts'} title='TopPorts' />
}))
jest.mock('./SwitchFrontRearView', () => ({
  SwitchFrontRearView: () =>
    <div data-testid={'rc-SwitchFrontRearView'} title='SwitchFrontRearView' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  SwitchBlinkLEDsDrawer: () =>
    <div data-testid={'rc-SwitchBlinkLEDsDrawer'} />
}))




describe('SwitchOverviewTab', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchOverviewPanel
        filters={filters}
        stackMember={stackMembersData}
        switchDetail={switchDetailSwitchOnline}
        currentSwitchDevice={currentSwitchDevice} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })
    expect(await screen.findByTestId('rc-SwitchFrontRearView')).toBeVisible()
    expect(await screen.findByTestId('rc-SwitchesTrafficByVolume')).toBeVisible()
    expect(await screen.findByTestId('rc-ResourceUtilization')).toBeVisible()
    expect(await screen.findByTestId('rc-SwitchStatusByTime')).toBeVisible()
    expect(await screen.findAllByTestId('rc-TopPorts')).toHaveLength(4)
  })

  it('should render switch blink LEDs correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchOverviewPanel
        filters={filters}
        stackMember={stackMembersData}
        currentSwitchDevice={currentSwitchDevice}
        switchDetail={switchDetailSwitchOnline} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })
    const blinkLedsButton = await screen.findByText('Blink LEDs')
    expect(blinkLedsButton).toBeVisible()
    await userEvent.click(blinkLedsButton)
    expect(await screen.findByTestId('rc-SwitchBlinkLEDsDrawer')).toBeVisible()
  })
}
)
