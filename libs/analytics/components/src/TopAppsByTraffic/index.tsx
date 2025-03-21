import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  NoData,
  DonutChart,
  qualitativeColorSet
} from '@acx-ui/components'
import type { DonutChartData }                      from '@acx-ui/components'
import { get }                                      from '@acx-ui/config'
import { Features, useIsSplitOn, useSplitOverride } from '@acx-ui/feature-toggle'
import { formatter }                                from '@acx-ui/formatter'
import { useGetPrivacySettingsQuery }               from '@acx-ui/rc/services'
import { PrivacyFeatureName }                       from '@acx-ui/rc/utils'
import { getJwtTokenPayload }                       from '@acx-ui/utils'
import { useTrackLoadTime, widgetsMapping }         from '@acx-ui/utils'
import type { AnalyticsFilter }                     from '@acx-ui/utils'

import { HierarchyNodeData, useTopAppsByTrafficQuery } from './services'

function getTopAppsByTrafficChartData (data: HierarchyNodeData): DonutChartData[] {
  const chartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()

  if (data && data?.topNAppByTotalTraffic?.length > 0) {
    data.topNAppByTotalTraffic.forEach(({ name, applicationTraffic }, i) => {
      chartData.push({
        name,
        value: applicationTraffic,
        color: colorMapping[i]
      })
    })
  }
  return chartData
}

export function dataFormatter (value: unknown){
  return formatter('bytesFormat')(value)
}

export function TopAppsByTraffic ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const noPermissionText = $t({ defaultMessage: 'No permission to view application data' })
  const isRA = Boolean(get('IS_MLISA_SA'))
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const { tenantId } = getJwtTokenPayload()

  // Use Split override only for privacy feature flag
  const { treatments, isReady: isSplitClientReady } = useSplitOverride(tenantId, [
    Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE
  ])

  const isAppPrivacyFFOn = treatments[Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE] === 'on'

  const { data: privacySettings } = useGetPrivacySettingsQuery({
    params: { tenantId },
    customHeaders: { 'x-rks-tenantid': tenantId },
    payload: { ignoreDelegation: true } })
  const [isAppVisibilityEnabled, setIsAppVisibilityEnabled] = useState(false)

  useEffect(() => {
    if(isSplitClientReady && (!isAppPrivacyFFOn || isRA)){
      setIsAppVisibilityEnabled(true)
    }
    else if (privacySettings) {
      const privacyVisibilitySetting = privacySettings
        .find(item => item.featureName === PrivacyFeatureName.APP_VISIBILITY)
      if(privacyVisibilitySetting?.isEnabled){
        setIsAppVisibilityEnabled(true)
      }
    }
  }, [isAppPrivacyFFOn, isRA, isSplitClientReady, privacySettings])

  const queryResults = useTopAppsByTrafficQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data: getTopAppsByTrafficChartData(data!),
      ...rest
    })
  })

  const isDataAvailable = isAppVisibilityEnabled &&
    queryResults.data && queryResults.data.length > 0

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
            isDataAvailable ?
              <div style={{ margin: '10px 0px' }}>
                <DonutChart
                  style={{ width, height: height-30 }}
                  data={queryResults.data}
                  showLegend={true}
                  showTotal={false}
                  legend='name'
                  dataFormatter={dataFormatter}
                  size={'x-large'}
                />
              </div>
              : <NoData text={isAppVisibilityEnabled === false ? noPermissionText : undefined}/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
