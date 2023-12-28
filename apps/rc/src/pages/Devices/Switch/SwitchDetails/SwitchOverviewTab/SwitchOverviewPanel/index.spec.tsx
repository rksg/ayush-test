import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import { stackMembersData } from './__tests__/fixtures'

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
      <SwitchOverviewPanel filters={filters} stackMember={stackMembersData} />
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

}
)
