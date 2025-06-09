import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  Table,
  NoData,
  SparklineChart,
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import { get }                              from '@acx-ui/config'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { formatter, intlFormats }           from '@acx-ui/formatter'
import { useGetPrivacySettingsQuery }       from '@acx-ui/rc/services'
import { PrivacyFeatureName }               from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import { useTopApplicationsByTrafficQuery, TopApplicationByTrafficData } from './services'
import { TrafficPercent }                                                from './styledComponents'


export function TopApplicationsByTraffic ({
  filters, tabId
}: {
  filters: AnalyticsFilter;
  tabId: string;
}) {
  const { $t } = useIntl()
  const noPermissionText = $t({ defaultMessage: 'No permission to view application data' })
  const isRA = Boolean(get('IS_MLISA_SA'))
  const { tenantId } = useParams()

  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const isAppPrivacyFFEnabled = useIsSplitOn(Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE)

  const queryResults = useTopApplicationsByTrafficQuery(filters)
  const { data: privacySettings } = useGetPrivacySettingsQuery({ params: { tenantId } })
  const [isAppVisibilityEnabled, setIsAppVisibilityEnabled] = useState(false)
  const enabledUXOptFeature = useIsSplitOn(Features.UX_OPTIMIZATION_FEATURE_TOGGLE)

  useEffect(() => {
    if(!isAppPrivacyFFEnabled || isRA){
      setIsAppVisibilityEnabled(true)
    }
    else if (privacySettings) {
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


  const columns=[
    {
      title: $t({ defaultMessage: 'Application' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Traffic' }),
      dataIndex: 'traffic',
      key: 'traffic'
    },
    {
      title: $t({ defaultMessage: 'Traffic History' }),
      dataIndex: 'trafficHistory',
      key: 'trafficHistory'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      align: 'right' as const
    }
  ]

  const getDataSource= (appTrafficData: TopApplicationByTrafficData[],
    overallTrafic:number) => {
    return appTrafficData.map((item,index) => {
      const sparkLineData = item.timeSeries.applicationTraffic
        .map(value => value ? value : 0)
      const sparklineChartStyle = { height: 18, width: 80, display: 'inline' }
      return {
        ...item,
        traffic: <Space align='start' size={4}>
          <>
            {formatter('bytesFormat')(item.applicationTraffic)}
            <TrafficPercent>
            ({$t(intlFormats.percentFormatRound, { value: item.applicationTraffic/overallTrafic })})
            </TrafficPercent>
          </>
        </Space>,
        trafficHistory: <SparklineChart
          key={index}
          data={sparkLineData}
          style={sparklineChartStyle}/>
      }
    })
  }

  const { data } = queryResults

  const uploadTable = data && data.topNAppByUpload && data.topNAppByUpload.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNAppByUpload, data.uploadAppTraffic)}
    type='compact'
    rowKey='name'
  /> : <NoData/>

  const downloadTable = data && data.topNAppByDownload && data.topNAppByDownload.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNAppByDownload, data.downloadAppTraffic)}
    type='compact'
    rowKey='name'
  /> : <NoData/>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Upload' }) , children: uploadTable, value: 'upload' },
    { label: $t({ defaultMessage: 'Download' }), children: downloadTable, value: 'download' }
  ]

  useTrackLoadTime({
    itemName: widgetsMapping.TOP_APPLICATIONS_BY_TRAFFIC,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Applications by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              {isAppVisibilityEnabled ?
                <ContentSwitcher
                  tabId={tabId}
                  tabDetails={tabDetails}
                  size='small'
                  tabPersistence={enabledUXOptFeature} />
                : <NoData text={noPermissionText}/>}
            </div>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
