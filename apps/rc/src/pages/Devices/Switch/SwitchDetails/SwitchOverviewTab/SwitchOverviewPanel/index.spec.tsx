import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
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


const portlist = {
  fields: [
    'portIdentifier',
    'id'
  ],
  totalCount: 16,
  page: 1,
  data: [
    {
      cloudPort: true,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/1',
      id: 'c0-c5-20-aa-32-79_1-1-1',
      lagId: '1',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: true,
      portIdentifier: '1/1/10',
      id: 'c0-c5-20-aa-32-82_1-1-10',
      lagId: '0',
      syncedSwitchConfig: false
    }
  ]
}

describe('SwitchOverviewTab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlist)))
    )
  })

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

  it('should render SwitchesTrafficByVolume portOptions correctly', async () => {
    const useStateSpy = jest.spyOn(React, 'useState')
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
    expect(await screen.findByTestId('rc-SwitchesTrafficByVolume')).toBeVisible()
    expect(useStateSpy).toBeCalled()
  })
}
)
