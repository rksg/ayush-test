import { Badge, Space } from 'antd'
import { useIntl }      from 'react-intl'
import AutoSizer        from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData } from '@acx-ui/components'
import type { DonutChartData }                             from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { useIotControllerLicenseStatusQuery }              from '@acx-ui/rc/services'
import {
  RcapLicenseUtilizationEnum,
  RcapLicenseUtilizationData,
  RcapLicenseUtilizationDataV2
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
export const getRcapLicenseUtilizationDonutChartData = (rcapSummary?: RcapLicenseUtilizationData): { data: DonutChartData[], value?: string } => {
  const seriesMapping = [
    { key: RcapLicenseUtilizationEnum.USED,
      name: 'Used',
      color: cssStr('--acx-accents-blue-30') },
    { key: RcapLicenseUtilizationEnum.AVAILABLE,
      name: 'Available',
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []
  let total = 0

  if (rcapSummary) {
    // Calculate total first
    const used = rcapSummary[RcapLicenseUtilizationEnum.USED] as number || 0
    const available = rcapSummary[RcapLicenseUtilizationEnum.AVAILABLE] as number || 0
    total = used + available

    seriesMapping.forEach(({ key, name, color }) => {
      if (rcapSummary[key as keyof RcapLicenseUtilizationData]) {
        if (key === RcapLicenseUtilizationEnum.AVAILABLE) {
          chartData.push({
            name,
            // eslint-disable-next-line max-len
            value: rcapSummary[RcapLicenseUtilizationEnum.AVAILABLE] as number - (rcapSummary[RcapLicenseUtilizationEnum.USED] as number),
            color
          })
        } else {
          chartData.push({
            name,
            value: rcapSummary[key as keyof RcapLicenseUtilizationData] as number,
            color
          })
        }
      }
    })
  }

  // Return "Unlimited" if total exceeds 100,0000
  const value = total >= 1000000 ? 'Unlimited' : undefined

  return { data: chartData, value }
}

export function RcapLicenseUtilization () {
  const { $t } = useIntl()
  const isIotDashboardApi = useIsSplitOn(Features.IOT_DASHBOARD_API)

  const overviewQuery = useIotControllerLicenseStatusQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => {
      let processedData: RcapLicenseUtilizationData | undefined
      if (isIotDashboardApi && (data as RcapLicenseUtilizationDataV2)?.ok) {
        const v2Data = (data as RcapLicenseUtilizationDataV2).data
        // Transform V2 data to the expected format if needed
        processedData = v2Data as RcapLicenseUtilizationData
      } else {
        processedData = data as RcapLicenseUtilizationData
      }
      const result = getRcapLicenseUtilizationDonutChartData(processedData)
      return {
        data: result.data,
        value: result.value,
        ...rest
      }
    }
  })

  const { data, value } = overviewQuery

  const subTitle = <Space style={{ alignSelf: 'center', marginTop: '18px' }}>
    <Badge
      color={'var(--acx-accents-blue-30)'}
      text={$t({ defaultMessage: 'Used' })}
    />
    <Badge
      color={'var(--acx-accents-orange-30)'}
      text={$t({ defaultMessage: 'Available' })}
    />
  </Space>

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'RCAP License Utilization' })}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0)
              ? <UI.Container>
                <DonutChart
                  style={{ width, height: height - 50 }}
                  size={'medium'}
                  data={data}
                  value={value}
                  showTotal={!value}/>
                {subTitle}
              </UI.Container>
              : <NoActiveData text={$t({ defaultMessage: 'No RCAP License Utilization' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
