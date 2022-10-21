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
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

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

describe('Test', () => {
  fixtures.mockTimeSeries()
  fixtures.mockNetworkImpact()

  describe('Details', () => {
    [
      {
        component: ApinfraPoeLow,
        fakeIncident: fakeIncidentPoeLow,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: ApinfraWanthroughputLow,
        fakeIncident: fakeIncidentApInfraWanthroughput,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: ApservContinuousReboots,
        fakeIncident: fakeIncidentContReboot,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: ApservDowntimeHigh,
        fakeIncident: fakeIncidentDowntimeHigh,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: ApservHighNumReboots,
        fakeIncident: fakeIncidentHighReboot,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: AssocFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: AuthFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: CovClientrssiLow,
        fakeIncident: fakeIncidentRss,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: DhcpFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: EapFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: RadiusFailure,
        fakeIncident: fakeIncident1,
        hasNetworkImpact: true,
        hasTimeSeries: true
      },
      {
        component: SwitchMemoryHigh,
        fakeIncident: fakeIncidentSwitchMemory,
        hasNetworkImpact: false,
        hasTimeSeries: false
      },
      {
        component: SwitchPoePd,
        fakeIncident: fakeIncidentPoePd,
        hasNetworkImpact: false,
        hasTimeSeries: false
      },
      {
        component: SwitchVlanMismatch,
        fakeIncident: fakeIncidentPoePd,
        hasNetworkImpact: false,
        hasTimeSeries: false
      },
      {
        component: Ttc,
        fakeIncident: fakeIncidentTtc,
        hasNetworkImpact: true,
        hasTimeSeries: true
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
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})
