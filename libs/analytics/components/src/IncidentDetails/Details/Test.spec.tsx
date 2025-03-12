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
  fakeIncidentTtc,
  fakeIncidentChannelDist,
  fakeIncidentNetTime,
  fakeIncidentNetSzNetLatency,
  fakeIncidentLoadSzCpuLoad,
  fakeIncidentAirtimeBWithSameTime,
  fakeIncidentAirtimeB,
  fakeIncidentAirtimeRxWithSameTime,
  fakeIncidentAirtimeRx,
  fakeIncidentAirtimeTxWithSameTime,
  fakeIncidentAirtimeTx,
  IncidentCode,
  fakeIncidentDDoS,
  fakeIncidentPortCongestion,
  fakeIncidentUplinkPortCongestion,
  fakeIncidentLoopDetection
}                         from '@acx-ui/analytics/utils'
import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { Provider }                            from '@acx-ui/store'
import { render, screen }                      from '@acx-ui/test-utils'
import { RolesEnum, SwitchScopes, WifiScopes } from '@acx-ui/types'
import { getUserProfile, setUserProfile }      from '@acx-ui/user'

import * as fixtures                  from './__tests__/fixtures'
import { AirtimeB }                   from './AirtimeB'
import { AirtimeRx }                  from './AirtimeRx'
import { AirtimeTx }                  from './AirtimeTx'
import { ApinfraPoeLow }              from './ApinfraPoeLow'
import { ApinfraWanthroughputLow }    from './ApinfraWanthroughputLow'
import { ApservContinuousReboots }    from './ApservContinuousReboots'
import { ApservDowntimeHigh }         from './ApservDowntimeHigh'
import { ApservHighNumReboots }       from './ApservHighNumReboots'
import { AssocFailure }               from './AssocFailure'
import { AuthFailure }                from './AuthFailure'
import { ChannelDist }                from './ChannelDist'
import { CovClientrssiLow }           from './CovClientrssiLow'
import { DhcpFailure }                from './DhcpFailure'
import { EapFailure }                 from './EapFailure'
import { LoadSzCpuLoad }              from './LoadSzCpuLoad'
import { NetSzNetLatency }            from './NetSzNetLatency'
import { NetTime }                    from './NetTime'
import { RadiusFailure }              from './RadiusFailure'
import { SwitchLoopDetection }        from './SwitchLoopDetection'
import { SwitchMemoryHigh }           from './SwitchMemoryHigh'
import { SwitchPoePd }                from './SwitchPoePd'
import { SwitchPortCongestion }       from './SwitchPortCongestion'
import { SwitchTcpSynDDoS }           from './SwitchTcpSynDDoS'
import { SwitchUplinkPortCongestion } from './SwitchUplinkPortCongestion'
import { SwitchVlanMismatch }         from './SwitchVlanMismatch'
import { Ttc }                        from './Ttc'


jest.mock('./MuteIncident', () => ({ MuteIncident: () => <div data-testid='muteIncident' /> }))
jest.mock('../Insights', () => ({ Insights: () => <div data-testid='insights' /> }))
jest.mock('../NetworkImpact')
jest.mock('../IncidentDetails/TimeSeries')

jest.mock('../ChannelConfig', () => ({
  ChannelConfig: () => <div data-testid='channelConfig' />
}))
jest.mock('../Charts/ChannelDistributionHeatmap', () => ({
  ...jest.requireActual('../Charts/ChannelDistributionHeatmap'),
  ChannelDistributionHeatMap: () => <div data-testid='channelDistributionHeatMap' />
}))
jest.mock('../Charts/RssDistributionChart', () => ({
  RssDistributionChart: () => <div data-testid='rssDistributionChart' />
}))
jest.mock('../Charts/PoeLowTable', () => ({
  PoeLowTable: () => <div data-testid='poeLowTable' />
}))
jest.mock('../Charts/PoePdTable', () => ({
  PoePdTable: () => <div data-testid='poePdTable' />
}))
jest.mock('../Charts/ImpactedSwitchVLANsTable', () => ({
  ImpactedSwitchVLANsTable: () => <div data-testid='impactedSwitchVLANsTable' />
}))
jest.mock('../Charts/ImpactedSwitchVLANDetails', () => ({
  ImpactedSwitchVLANsDetails: () => <div data-testid='impactedSwitchVLANsDetails' />
}))
jest.mock('../Charts/ImpactedSwitchDDoS', () => ({
  ImpactedSwitchDDoSTable: () => <div data-testid='impactedSwitchDDoSTable' />
}))

jest.mock('../Charts/ImpactedSwitchesDonut', () => ({
  ImpactedSwitchesDonut: () => <div data-testid='impactedSwitchesDonut' />
}))

jest.mock('../Charts/ImpactedSwitchesDonut/byParam', () => ({
  ImpactedSwitchesByParamDonut: () => <div data-testid='ImpactedSwitchesByParamDonut' />
}))

jest.mock('../Charts/ImpactedSwitchPortCongestion', () => ({
  SwitchDetail: () => <div data-testid='SwitchDetail' />,
  ImpactedSwitchPortConjestionTable: () => <div data-testid='ImpactedSwitchPortConjestionTable' />
}))

jest.mock('../Charts/ImpactedSwitchLoopDetection', () => ({
  ImpactedVlanTable: () => <div data-testid='impactedVlanTable' />
}))

jest.mock('../Charts/ImpactedUplinkPortDetails', () => ({
  ImpactedUplinkPortDetails: () => <div data-testid='impactedUplinkPortDetails' />
}))

jest.mock('../Charts/ImpactedSwitchUplinkTable', () => ({
  ImpactedSwitchUplinkTable: () => <div data-testid='impactedSwitchUplinkTable' />
}))

jest.mock('../Charts/WanthroughputTable', () => ({
  WanthroughputTable: () => <div data-testid='wanthroughputTable' />
}))
jest.mock('../Charts/SwitchDetail', () => ({
  SwitchDetail: () => <div data-testid='switchDetail' />
}))

describe('Test', () => {
  fixtures.mockTimeSeries()
  fixtures.mockNetworkImpact()

  describe('Details', () => {
    [
      {
        component: ApinfraPoeLow,
        fakeIncident: fakeIncidentPoeLow,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: ['poeLowTable']
      },
      {
        component: ApinfraWanthroughputLow,
        fakeIncident: fakeIncidentApInfraWanthroughput,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: ['wanthroughputTable']
      },
      {
        component: ApservContinuousReboots,
        fakeIncident: fakeIncidentContReboot,
        hasNetworkImpact: true,
        hasTimeSeries: true,
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
        hasTimeSeries: true,
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
        hasTimeSeries: true,
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
        hasTimeSeries: true,
        charts: ['switchDetail']
      },
      {
        component: SwitchPoePd,
        fakeIncident: fakeIncidentPoePd,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: ['poePdTable']
      },
      {
        component: SwitchVlanMismatch,
        fakeIncident: fakeIncidentPoePd,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: ['impactedSwitchVLANsTable']
      },
      {
        component: SwitchTcpSynDDoS,
        fakeIncident: fakeIncidentDDoS,
        hasNetworkImpact: false,
        hasTimeSeries: true,
        charts: ['impactedSwitchDDoSTable']
      },
      {
        component: SwitchLoopDetection,
        fakeIncident: fakeIncidentLoopDetection,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: SwitchPortCongestion,
        fakeIncident: fakeIncidentPortCongestion,
        hasNetworkImpact: false,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: SwitchUplinkPortCongestion,
        fakeIncident: fakeIncidentUplinkPortCongestion,
        hasNetworkImpact: false,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: Ttc,
        fakeIncident: fakeIncidentTtc,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: ChannelDist,
        fakeIncident: fakeIncidentChannelDist, // 5g
        hasNetworkImpact: false,
        hasTimeSeries: true,
        charts: ['channelDistributionHeatMap']
      },
      {
        component: ChannelDist,
        fakeIncident: { ...fakeIncidentChannelDist,
          code: 'p-channeldist-suboptimal-plan-24g' as IncidentCode }, // 2.4g
        hasNetworkImpact: false,
        hasTimeSeries: true,
        charts: ['channelDistributionHeatMap']
      },
      {
        component: NetTime,
        fakeIncident: fakeIncidentNetTime,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: NetSzNetLatency,
        fakeIncident: fakeIncidentNetSzNetLatency,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: LoadSzCpuLoad,
        fakeIncident: fakeIncidentLoadSzCpuLoad,
        hasNetworkImpact: false,
        hasTimeSeries: false,
        charts: []
      },
      {
        component: AirtimeB,
        fakeIncident: fakeIncidentAirtimeBWithSameTime,
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeB,
        fakeIncident: {
          ...fakeIncidentAirtimeBWithSameTime, code: 'p-airtime-b-5g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeB,
        fakeIncident: { ...fakeIncidentAirtimeB, code: 'p-airtime-b-6(5)g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeRx,
        fakeIncident: {
          ...fakeIncidentAirtimeRxWithSameTime, code: 'p-airtime-rx-24g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeRx,
        fakeIncident: {
          ...fakeIncidentAirtimeRxWithSameTime, code: 'p-airtime-rx-5g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeRx,
        fakeIncident: {
          ...fakeIncidentAirtimeRx, code: 'p-airtime-rx-6(5)g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeTx,
        fakeIncident: {
          ...fakeIncidentAirtimeTxWithSameTime, code: 'p-airtime-tx-24g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeTx,
        fakeIncident: {
          ...fakeIncidentAirtimeTxWithSameTime, code: 'p-airtime-tx-5g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      },
      {
        component: AirtimeTx,
        fakeIncident: {
          ...fakeIncidentAirtimeTx, code: 'p-airtime-tx-6(5)g-high' as IncidentCode },
        hasNetworkImpact: true,
        hasTimeSeries: true,
        charts: []
      }
    ].forEach((test) => {
      it(`should render ${test.component.name} correctly`, () => {
        jest.mocked(useIsSplitOn).mockReturnValue(true)
        const params = { incidentId: test.fakeIncident.id }
        const { asFragment } = render(<Provider>
          <test.component {...test.fakeIncident} />
        </Provider>, { route: { params } })

        expect(screen.getByTestId('muteIncident')).toBeVisible()
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
          expect(screen.getAllByTestId(chart).length).toBeGreaterThanOrEqual(1)
        })
        expect(asFragment()).toMatchSnapshot()
      })
      it(`should hide mute for ${test.component.name} when role = READ_ONLY`, () => {
        jest.mocked(useIsSplitOn).mockReturnValue(true)
        const profile = getUserProfile()
        setUserProfile({ ...profile, profile: {
          ...profile.profile, roles: [RolesEnum.READ_ONLY]
        } })
        const params = { incidentId: test.fakeIncident.id }
        render(<Provider>
          <test.component {...test.fakeIncident} />
        </Provider>, { route: { params } })
        expect(screen.queryByTestId('muteIncident')).not.toBeInTheDocument()
      })
      it(`should hide mute for ${test.component.name} when scope does not match`, () => {
        const { sliceType } = test.fakeIncident
        jest.mocked(useIsSplitOn).mockReturnValue(true)
        setUserProfile({
          ...getUserProfile(),
          abacEnabled: true,
          isCustomRole: true,
          scopes: [sliceType.startsWith('switch') ? WifiScopes.UPDATE : SwitchScopes.UPDATE]
        })
        const params = { incidentId: test.fakeIncident.id }
        render(<Provider>
          <test.component {...test.fakeIncident} />
        </Provider>, { route: { params } })
        expect(screen.queryByTestId('muteIncident')).not.toBeInTheDocument()
      })
    })
  })
  describe('Feature Flag Off', () => {
    [{
      component: SwitchTcpSynDDoS,
      fakeIncident: fakeIncidentDDoS,
      hasNetworkImpact: false,
      hasTimeSeries: true,
      charts: ['impactedSwitchDDoSTable','impactedSwitchDDoSDonut']
    },
    {
      component: SwitchLoopDetection,
      fakeIncident: fakeIncidentLoopDetection,
      hasNetworkImpact: false,
      hasTimeSeries: false,
      charts: []
    },
    {
      component: SwitchPortCongestion,
      fakeIncident: fakeIncidentPortCongestion,
      hasNetworkImpact: false,
      hasTimeSeries: true,
      charts: []
    },
    {
      component: SwitchUplinkPortCongestion,
      fakeIncident: fakeIncidentUplinkPortCongestion,
      hasNetworkImpact: false,
      hasTimeSeries: true,
      charts: ['ImpactedUplinkPortDetails']
    }].forEach((test) => it(`should not render anything for ${test.component.name}`, () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      const params = { incidentId: test.fakeIncident.id }
      const { asFragment } = render(<Provider>
        <test.component {...test.fakeIncident} />
      </Provider>, { route: { params } })
      expect(asFragment()).toMatchSnapshot()
    }))
  })
})
