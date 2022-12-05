import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl }            from 'react-intl'

import { BarChart, cssStr, cssNumber, Loader, Card, GridRow, Subtitle } from '@acx-ui/components'
import {
  Client,
  ClientStatistic
} from '@acx-ui/rc/utils'
import {
  convertEpochToRelativeTime,
  formatter
} from '@acx-ui/utils'

import * as UI from './styledComponents'

export function ApOverviewWidget ({ data, clientStatus, clientDetails }: {
  data: ClientStatistic | undefined,
  clientStatus: string,
  clientDetails: Client
}) {
  const { $t } = useIntl()

  return <Card type='solid-bg'>
    <Loader states={[{
      isLoading: !Object.keys(clientStatus).length
        || !Object.keys(clientDetails).length
    }]}>
      <GridRow style={{ flexGrow: '1' }}>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Current Status' })
          }</UI.Title>
          <Subtitle level={2}>{
            clientStatus.toUpperCase()
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'APs Connected' })
          }</UI.Title>
          <Subtitle level={2}>{
            data?.apsConnected
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 4 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Avg. Rate' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('bytesFormat')(data?.avgRateBPS)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'User Traffic' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('bytesFormat')(data?.userTrafficBytes)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Total Connected Time' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('durationFormat')(
              convertEpochToRelativeTime(clientDetails.timeConnectedMs)
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
            Math.floor(data?.applications ?? 0)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Avg. Session Length' })
          }</UI.Title>
          <Subtitle level={2}>{
            formatter('durationFormat')(data?.avgSessionLengthSeconds)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 4 }}>
          <UI.Title>{
            $t({ defaultMessage: 'Sessions' })
          }</UI.Title>
          <Subtitle level={2}>{
            Math.floor(data?.sessions ?? 0)
          }</Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          {getUserTrafficChart(data as ClientStatistic)}
        </UI.GridCol>
        <UI.GridCol col={{ span: 5 }}>
          {/* TODO: health chart of connected time */}
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
    const value = (params.data as string[])?.[1] ?? params.data
    const unit = (params.data as string[])?.[2] ?? params.data
    const userTraffic = value ? value + '' + (unit) : '--'
    return '{user_traffic|' + userTraffic + '}'
  }

  // TODO
  const getLabelRichStyle = () => ({
    user_traffic: {
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
    style={{ height: 140 }}
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
    labelRichStyle={getLabelRichStyle}
    barColors={getBarColors}
  />
}