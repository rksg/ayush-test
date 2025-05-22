import { useState, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { getSeriesData } from '@acx-ui/analytics/utils'
import {
  DonutChart,
  DonutChartData,
  StackedAreaChart,
  HistoricalCard,
  Loader,
  NoData,
  qualitativeColorSet
}                               from '@acx-ui/components'
import { get }                        from '@acx-ui/config'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { formatter }                  from '@acx-ui/formatter'
import { useGetPrivacySettingsQuery } from '@acx-ui/rc/services'
import { PrivacyFeatureName }         from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }       from '@acx-ui/utils'

import { App, useTopApplicationsQuery } from './services'

const useAppVisibility = (tenantId: string | undefined) => {
  const isRA = Boolean(get('IS_MLISA_SA'))
  const isAppPrivacyFFEnabled = useIsSplitOn(Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE)

  const { data: privacySettings } = useGetPrivacySettingsQuery({
    params: { tenantId }
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

function getTopApplicationsDonutChartData (data: App[]): DonutChartData[] {
  const chartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()
  if (data && data.length > 0) {
    data.forEach(({ name, applicationTraffic }, i) => {
      chartData.push({
        name,
        value: applicationTraffic,
        color: colorMapping[i]
      })
    })
  }
  return chartData
}

function getTopApplicationsLineChartData (data: App[]) {
  let seriesMapping: { key: string, name:string }[] = []
  const tmpData: { [key:string]: number[] | string[] } = {}
  tmpData['time'] = data[0].timeSeries.time
  data.forEach(item=> {
    tmpData[item.name] = item.timeSeries.applicationTraffic
    seriesMapping.push({ key: item.name, name: item.name })
  })
  return getSeriesData(tmpData, seriesMapping)
}

export { TopApplicationsWidget as TopApplications }

function TopApplicationsWidget ({ filters, type }: {
  filters: AnalyticsFilter,
  type: 'donut' | 'line' }) {
  const { $t } = useIntl()
  const noPermissionText = $t({ defaultMessage: 'No permission to view application data' })
  const { tenantId } = useParams()
  const isAppVisibilityEnabled = useAppVisibility(tenantId)

  const queryResults = useTopApplicationsQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data,
      ...rest
    })
  })
  const isDataAvailable = isAppVisibilityEnabled &&
    queryResults.data && queryResults.data.length > 0

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top 10 Applications by traffic volume' })}>
        <AutoSizer>
          {({ height, width }) => (
            isDataAvailable ?
              ( type === 'donut'
                ? <DonutChart
                  style={{ width, height }}
                  data={getTopApplicationsDonutChartData(queryResults.data!)}
                  title={$t({ defaultMessage: 'User Traffic' })}
                  showLabel={true}
                  showTotal={true}
                  showLegend={false}
                  tooltipFormat={defineMessage({
                    defaultMessage: `{name}<br></br>
                    <space><b>{formattedValue}</b> ({formattedPercent})</space>`
                  })}
                  dataFormatter={formatter('bytesFormat')}
                  size={'large'}
                />
                : <StackedAreaChart
                  style={{ width, height }}
                  type='step'
                  data={getTopApplicationsLineChartData(queryResults.data!)}
                  dataFormatter={formatter('bytesFormat')}
                  legendFormatter={() => ''}
                />
              )
              : <NoData text={isAppVisibilityEnabled ? undefined : noPermissionText} />
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
