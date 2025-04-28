import { useEffect, useState, useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  NoData,
  DonutChart,
  qualitativeColorSet
} from '@acx-ui/components'
import type { DonutChartData }              from '@acx-ui/components'
import { get }                              from '@acx-ui/config'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { formatter }                        from '@acx-ui/formatter'
import { useGetPrivacySettingsQuery }       from '@acx-ui/rc/services'
import { PrivacyFeatureName }               from '@acx-ui/rc/utils'
import { getJwtTokenPayload }               from '@acx-ui/utils'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import { HierarchyNodeData, useTopAppsByTrafficQuery } from './services'

const CHART_MARGIN = '10px 0px'
const CHART_HEIGHT_OFFSET = 30
const CHART_SIZE = 'x-large'

interface ChartProps {
  data: DonutChartData[]
  width: number
  height: number
}

const transformChartData = (data: HierarchyNodeData | undefined): DonutChartData[] => {
  if (!data?.topNAppByTotalTraffic?.length) return []

  const colorMapping = qualitativeColorSet()
  return data.topNAppByTotalTraffic.map(({ name, applicationTraffic }, i) => ({
    name,
    value: applicationTraffic,
    color: colorMapping[i]
  }))
}

export const dataFormatter = (value: unknown): string => formatter('bytesFormat')(value)

const useAppVisibility = (tenantId: string) => {
  const isRA = Boolean(get('IS_MLISA_SA'))
  const isAppPrivacyFFEnabled = useIsSplitOn(
    Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE, tenantId)

  const { data: privacySettings } = useGetPrivacySettingsQuery({
    params: { tenantId },
    customHeaders: { 'x-rks-tenantid': tenantId },
    payload: { ignoreDelegation: true }
  })

  const [isAppVisibilityEnabled, setIsAppVisibilityEnabled] = useState(false)

  useEffect(() => {
    if (!isAppPrivacyFFEnabled || isRA) {
      setIsAppVisibilityEnabled(true)
      return
    }

    if (privacySettings) {
      const privacyVisibilitySetting = privacySettings
        .find(item => item.featureName === PrivacyFeatureName.APP_VISIBILITY)
      // For privacy settings: if enforceDefault is true, ignore isEnabled
      // if enforceDefault is false, use isEnabled value
      setIsAppVisibilityEnabled(
        Boolean(privacyVisibilitySetting?.enforceDefault ||
        privacyVisibilitySetting?.isEnabled)
      )
    }
  }, [isAppPrivacyFFEnabled, isRA, privacySettings])

  return isAppVisibilityEnabled
}

const Chart: React.FC<ChartProps> = ({ data, width, height }) => (
  <div style={{ margin: CHART_MARGIN }}>
    <DonutChart
      style={{ width, height: height - CHART_HEIGHT_OFFSET }}
      data={data}
      showLegend={true}
      showTotal={false}
      legend='name'
      dataFormatter={dataFormatter}
      size={CHART_SIZE}
    />
  </div>
)

export function TopAppsByTraffic ({ filters }: { filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const noPermissionText = $t({ defaultMessage: 'No permission to view application data' })
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const { tenantId } = getJwtTokenPayload()

  const isAppVisibilityEnabled = useAppVisibility(tenantId)
  const { data: chartData, ...queryResults } = useTopAppsByTrafficQuery(filters)

  // Memoize the transformed chart data
  const transformedData = useMemo(() =>
    transformChartData(chartData),
  [chartData]
  )

  const isDataAvailable = isAppVisibilityEnabled && transformedData.length > 0

  useTrackLoadTime({
    itemName: widgetsMapping.TOP_APPS_BY_TRAFFIC,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Applications by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => (
            isDataAvailable ? (
              <Chart
                data={transformedData}
                width={width}
                height={height}
              />
            ) : (
              <NoData text={!isAppVisibilityEnabled ? noPermissionText : undefined}/>
            )
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
