import { isArray } from 'lodash'
import { useIntl } from 'react-intl'

import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  wiredKPIsForTab,
  wiredKPIsForTabPhase2
} from '@acx-ui/analytics/utils'
import { Loader, ContentSwitcher, Card } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import type { AnalyticsFilter }          from '@acx-ui/utils'

import { KpiSection, defaultThreshold } from '../../../Health/Kpi'

type KpiThresholdsQueryProps = {
  filters: AnalyticsFilter
}

export const useKpiThresholdsQuery = (
  { filters }: KpiThresholdsQueryProps,
  options?: { skip?: boolean }
) => {
  const kpis = Object.keys(defaultThreshold) as (keyof KpiThresholdType)[]
  const kpiThresholdsQueryResults =
    healthApi.useGetKpiThresholdsQuery({ ...filters, kpis }, options)
  const thresholds = kpis.reduce((agg, kpi) => {
    agg[kpi] = kpiThresholdsQueryResults.data?.[`${kpi}Threshold`]?.value ?? defaultThreshold[kpi]
    return agg
  }, {} as KpiThresholdType)

  return { thresholds, kpiThresholdsQueryResults }
}

// Custom component to handle the banner for empty Table tab
function CustomKpiSection (props: {
  isSwitch?: boolean
  kpis: string[] | { [subTab:string]:string[] }
  thresholds: KpiThresholdType
  mutationAllowed: boolean
  filters: AnalyticsFilter
  tab: CategoryTab
}) {
  const { kpis, tab, filters, ...restProps } = props
  const { $t } = useIntl()

  // Only make API call when we're on infrastructure tab with Table section
  const shouldCheckDeviceCount = tab === 'infrastructure' && !isArray(kpis) && 'Table' in kpis

  // Get total device count from IPv4 Unicast Table Compliance KPI - only when needed
  const { data: ipv4UnicastData } = healthApi.useKpiTimeseriesQuery({
    ...filters,
    kpi: 'switchIpv4UnicastUtilization',
    enableSwitchFirmwareFilter: true
  }, {
    skip: !shouldCheckDeviceCount // Skip API call when not needed
  })

  // Extract total count from the latest valid data point (same as transformTSResponse logic)
  const validDataPoints = ipv4UnicastData?.data?.filter(
    point => point !== null && Array.isArray(point)
  ) || []
  const latestDataPoint = validDataPoints[validDataPoints.length - 1]
  const totalCount = latestDataPoint?.[1] || 0 // totalCount is at index 1
  const hasDevices = totalCount > 30

  // If we have phase 2 structure (object kpis), always use ContentSwitcher
  if (shouldCheckDeviceCount) {
    const tabDetails = Object.keys(kpis).map((key) => {
      if (key === 'Table' && !hasDevices) {
        // For Table tab with low device count, show banner instead of KPIs
        return {
          label: 'Table',
          value: key,
          children: (
            <div style={{ marginTop: '16px' }}>
              <Card
                type='info-bg'
              >
                <div>
                  <p style={{ marginBottom: '12px' }}>
                    {$t({
                      defaultMessage: 'Additional Wired AI Health compliance KPIs below are ' +
                        'available on upgrading switches to FastIron version 10.0.10h or greater.'
                    })}
                  </p>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>IPv4 Unicast Table Compliance</li>
                    <li>IPv6 Unicast Table Compliance</li>
                    <li>IPv4 Multicast Table Compliance</li>
                    <li>IPv6 Multicast Table Compliance</li>
                    <li>ARP Table Compliance</li>
                    <li>MAC Table Compliance</li>
                  </ul>
                </div>
              </Card>
            </div>
          )
        }
      } else {
        // For other tabs (like System) or Table tab with enough devices, show normal KPIs
        const subTabKpis = (kpis as { [subTab: string]: string[] })[key]
        return {
          label: key,
          value: key,
          children: (
            <div style={{ marginTop: '16px' }}>
              <KpiSection
                {...restProps}
                kpis={subTabKpis}
                filters={filters}
              />
            </div>
          )
        }
      }
    })

    return (
      <ContentSwitcher
        tabDetails={tabDetails}
        size='small'
        align='left'
      />
    )
  }

  // Default behavior - use original KpiSection
  return <KpiSection {...restProps} kpis={kpis} filters={filters} />
}

export default function KpiSections (props: { tab: CategoryTab, filters: AnalyticsFilter }) {
  const { tab, filters } = props
  const { filter } = filters

  const isSwitchHealth10010eEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_10010E_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_10010E_TOGGLE)
  ].some(Boolean)

  const isSwitchHealthPhase2Enabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_PHASE2_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_PHASE2_TOGGLE)
  ].some(Boolean)

  const kpiTabs = isSwitchHealthPhase2Enabled ? wiredKPIsForTabPhase2 : wiredKPIsForTab
  const { kpis } = kpiTabs(isSwitchHealth10010eEnabled)[tab as keyof typeof wiredKPIsForTab]

  const { useFetchThresholdPermissionQuery } = healthApi
  const { thresholds, kpiThresholdsQueryResults } = useKpiThresholdsQuery({ filters })
  const thresholdPermissionQuery = useFetchThresholdPermissionQuery({ filter })
  const mutationAllowed = Boolean(thresholdPermissionQuery.data?.mutationAllowed)

  return <Loader states={[kpiThresholdsQueryResults, thresholdPermissionQuery]}>
    {kpiThresholdsQueryResults.fulfilledTimeStamp && <CustomKpiSection
      isSwitch
      key={kpiThresholdsQueryResults.fulfilledTimeStamp} // forcing component to rerender on newly received thresholds
      kpis={kpis}
      thresholds={thresholds}
      mutationAllowed={mutationAllowed}
      filters={{ ...filters }}
      tab={tab}
    />}
  </Loader>
}
