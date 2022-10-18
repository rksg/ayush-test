import {
  fakeIncident1,
  fakeIncidentPoeLow,
  fakeIncidentApInfraWanthroughput,
  fakeIncidentContReboot,
  fakeIncidentDowntimeHigh,
  fakeIncidentHighReboot,
  fakeIncidentRss,
  fakeIncidentSwitchMemory,
  fakeIncidentPoePd,
  fakeIncidentTtc
} from '@acx-ui/analytics/utils'
import { Provider }                     from '@acx-ui/store'
import { mockDOMWidth, render, screen } from '@acx-ui/test-utils'

import * as fixtures               from './__tests__/fixtures'
import { ApinfraPoeLow }           from './ApinfraPoeLow'
import { ApinfraWanthroughputLow } from './ApinfraWanthroughputLow'
import { ApservContinuousReboots } from './ApservContinuousReboots'
import { ApservDowntimeHigh }      from './ApservDowntimeHigh'
import { ApservHighNumReboots }    from './ApservHighNumReboots'
import { AssocFailure }            from './AssocFailure'
import { AuthFailure }             from './AuthFailure'
import { CovClientrssiLow }        from './CovClientrssiLow'
import { DhcpFailure }             from './DhcpFailure'
import { EapFailure }              from './EapFailure'
import { RadiusFailure }           from './RadiusFailure'
import { SwitchMemoryHigh }        from './SwitchMemoryHigh'
import { SwitchPoePd }             from './SwitchPoePd'
import { SwitchVlanMismatch }      from './SwitchVlanMismatch'
import { Ttc }                     from './Ttc'

jest.mock('../IncidentDetails/IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))
jest.mock('../NetworkImpact')
jest.mock('../IncidentDetails/TimeSeries')
jest.mock('../Charts/RssDistributionChart', () => ({
  RssDistributionChart: () => <div data-testid='rssDistributionChart' />
}))

describe('Test', () => {
  mockDOMWidth()
  fixtures.mockTimeSeries()
  fixtures.mockNetworkImpact()

  describe('Details', () => {
    [
      {
        component: ApinfraPoeLow,
        fakeIncident: fakeIncidentPoeLow,
        hasNetworkImpact: true,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: ApinfraWanthroughputLow,
        fakeIncident: fakeIncidentApInfraWanthroughput,
        hasNetworkImpact: true,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: ApservContinuousReboots,
        fakeIncident: fakeIncidentContReboot,
        hasNetworkImpact: true,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: ApservDowntimeHigh,
        fakeIncident: fakeIncidentDowntimeHigh,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: ApservHighNumReboots,
        fakeIncident: fakeIncidentHighReboot,
        hasNetworkImpact: true,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: AssocFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AuthFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: CovClientrssiLow,
        fakeIncident: fakeIncidentRss,
        hasNetworkImpact: true,
        hasTimeSeries: false,
        charts: ['rssDistributionChart']
      },
      {
        component: DhcpFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: EapFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: RadiusFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: SwitchMemoryHigh,
        fakeIncident: fakeIncidentSwitchMemory,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: SwitchPoePd,
        fakeIncident: fakeIncidentPoePd,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: SwitchVlanMismatch,
        fakeIncident: fakeIncidentPoePd,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: Ttc,
        fakeIncident: fakeIncidentTtc,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      }
    ].forEach((test) => {
      it(`should render ${test.component.name} correctly`, () => {
        const params = { incidentId: test.fakeIncident.id }
        const { asFragment } = render(<Provider>
          <test.component {...test.fakeIncident} />
        </Provider>, { route: { params } })
        expect(screen.getByTestId('incidentAttributes')).toBeVisible()
        expect(screen.getByTestId('insights')).toBeVisible()
        if (test.hasNetworkImpact) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(screen.getByTestId('networkImpact')).toBeVisible()
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(screen.queryByTestId('networkImpact')).toBeNull()
        }
        if (test.hasTimeSeries) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(screen.getByTestId('timeseries')).toBeVisible()
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(screen.queryByTestId('timeseries')).toBeNull()
        }
        test.charts.forEach(chart => {
          expect(screen.getByTestId(chart)).toBeVisible()
        })
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})
