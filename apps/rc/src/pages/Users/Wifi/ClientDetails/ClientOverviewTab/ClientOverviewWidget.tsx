import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl }            from 'react-intl'

import { ClientHealth }                                                 from '@acx-ui/analytics/components'
import { BarChart, cssStr, cssNumber, Loader, Card, GridRow, Subtitle } from '@acx-ui/components'
import { formatter, convertEpochToRelativeTime }                        from '@acx-ui/formatter'
import { Client, ClientStatistic }                                      from '@acx-ui/rc/utils'
import { useParams }                                                    from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                                         from '@acx-ui/utils'

import * as UI from './styledComponents'

export function ClientOverviewWidget ({ clientStatistic, clientStatus, clientDetails, filters }: {
  clientStatistic: ClientStatistic | undefined,
  clientStatus: string,
  clientDetails: Client,
  filters: AnalyticsFilter
}) {
  const { $t } = useIntl()
  const { clientId } = useParams()

  return <Card type='solid-bg'>
    <Loader states={[{
      isLoading: !Object.keys(clientStatistic ?? {}).length
        || !Object.keys(clientStatus).length
    }]}>
      <GridRow style={{ flexGrow: '1' }}>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Current Status' })
          }</UI.Title>
          <Subtitle level={2}>{
            clientStatus.toLowerCase() === 'connected'
              ? $t({ defaultMessage: 'Connected' })
              : $t({ defaultMessage: 'Disconnected' })
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'APs Connected' })
          }</UI.Title>
          <Subtitle level={2}>{
            clientStatistic?.apsConnected
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 4 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Avg. Rate' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('bytesFormat')(clientStatistic?.avgRateBPS)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'User Traffic' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('bytesFormat')(clientStatistic?.userTrafficBytes)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Current Connected Time' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('durationFormat')(
              clientDetails?.timeConnectedMs
                ? convertEpochToRelativeTime(clientDetails?.timeConnectedMs)
                : (clientDetails?.sessionDuration
                  ? clientDetails?.sessionDuration * 1000
                  : 0
                )
            )
          }</Subtitle>
        </UI.GridCol>
      </GridRow>
      <GridRow style={{ flexGrow: '1' }}>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Applications' })
          }</UI.Title>
          <Subtitle level={2}>{
            Math.floor(clientStatistic?.applications ?? 0)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Avg. Session Length' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('durationFormat')(clientStatistic?.avgSessionLengthSeconds)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 4 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Sessions' })
          }</UI.Title>
          <Subtitle level={2}>{
            Math.floor(clientStatistic?.sessions ?? 0)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.BarChartContainer>
            {getUserTrafficChart(clientStatistic as ClientStatistic)}
          </UI.BarChartContainer>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <ClientHealth filter={filters} clientMac={clientId as string} />
        </UI.GridCol>
      </GridRow>
    </Loader>
  </Card>
}

function getUserTrafficChart (data: ClientStatistic) {
  const totalTraffic = formatter('bytesFormat')(data?.userTrafficBytes)
  const totalValue = Number(totalTraffic?.split(' ')?.[0] ?? 0)
  const totalValueUnit = totalTraffic?.split(' ')?.[1]

  const getLabelFormatter = (params: CallbackDataParams) => {
    const value = (params.data as string[])?.[1]
    const unit = (params.data as string[])?.[2]
    const userTraffic = value ? value + '' + (unit) : '--'
    return '{traffic|' + userTraffic + '}'
  }

  const getLabelRichStyle = () => ({
    traffic: {
      color: cssStr('--acx-primary-black'),
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-subtitle-5-font-size'),
      lineHeight: cssNumber('--acx-subtitle-5-line-height'),
      fontWeight: cssNumber('--acx-subtitle-5-font-weight')
    }
  })

  const getValue = (value: number) => {
    const convertValue = (value / data?.userTrafficBytes * totalValue).toFixed(2)
    return Number(convertValue)
  }

  const getBarColors = [
    cssStr('--acx-accents-blue-25'),
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-accents-blue-60')
  ]

  return <BarChart
    style={{ height: 90 }}
    grid={{ height: 70 }}
    data={{
      dimensions: ['ChannelType', 'UserTraffic', 'Unit'],
      source: [
        ['6 GHz', getValue(data?.userTraffic6GBytes), totalValueUnit],
        ['5 GHz', getValue(data?.userTraffic5GBytes), totalValueUnit],
        ['2.4 GHz', getValue(data?.userTraffic24GBytes), totalValueUnit]
      ],
      seriesEncode: [{
        x: 'UserTraffic',
        y: 'ChannelType'
      }]
    }}
    labelFormatter={getLabelFormatter}
    labelRichStyle={getLabelRichStyle()}
    barColors={getBarColors}
  />
}
