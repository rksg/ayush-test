import { useEffect, useRef } from 'react'

import { Col, Row }           from 'antd'
import EChartsReact           from 'echarts-for-react'
import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl }            from 'react-intl'

import { ClientHealth }                                        from '@acx-ui/analytics/components'
import { AnalyticsFilter }                                     from '@acx-ui/analytics/utils'
import { BarChart, cssStr, cssNumber, Loader, Card, Subtitle } from '@acx-ui/components'
import { Client, ClientStatistic }                             from '@acx-ui/rc/utils'
import { convertEpochToRelativeTime, formatter }               from '@acx-ui/utils'

import * as UI from './styledComponents'

const UserTraffic = ({ data }: { data: ClientStatistic | undefined }) => {
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
    if (!data) return 0

    const convertValue = (value / data?.userTrafficBytes * totalValue).toFixed(2)
    return Number(convertValue)
  }

  const getBarColors = [
    cssStr('--acx-accents-blue-25'),
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-accents-blue-60')
  ]

  const divRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsReact>(null)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (divRef.current && chartRef.current) {
        const chart = chartRef.current.getEchartsInstance()
        chart.resize({ width: 80, height: 80 })
      }
    })

    if (divRef.current) {
      observer.observe(divRef.current)
    }

    return () => observer.disconnect()
  })


  return <Loader states={[{ isLoading: typeof data === 'undefined' }]} divRef={divRef}>
    <BarChart
      style={{ height: 100, width: 100 }}
      chartRef={chartRef}
      data={{
        dimensions: ['ChannelType', 'UserTraffic', 'Unit'],
        source: [
          ['6 GHz', getValue(data?.userTraffic6GBytes ?? 0), totalValueUnit],
          ['5 GHz', getValue(data?.userTraffic5GBytes ?? 0), totalValueUnit],
          ['2.4 GHz', getValue(data?.userTraffic24GBytes ?? 0), totalValueUnit]
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
  </Loader>
}

export function ClientOverviewWidget ({ clientStatistic, clientStatus, clientDetails, filters }: {
  clientStatistic: ClientStatistic | undefined,
  clientStatus: string,
  clientDetails: Client,
  filters: AnalyticsFilter
}) {
  const { $t } = useIntl()

  const CurrentStatus = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'Current Status' })}</UI.Title>
      <Subtitle level={2}>
        {clientStatus.toLowerCase() === 'connected'
          ? $t({ defaultMessage: 'Connected' })
          : $t({ defaultMessage: 'Disconnected' })}
      </Subtitle>
    </>

  const ApsConnected = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'APs Connected' })}</UI.Title>
      <Subtitle level={2}>{clientStatistic?.apsConnected}</Subtitle>
    </>

  const AvgRate = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'Avg. Rate' })}</UI.Title>
      <Subtitle level={2}>{formatter('bytesFormat')(clientStatistic?.avgRateBPS)}</Subtitle>
    </>

  const UserTrafficWidget = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'User Traffic' })}</UI.Title>
      <UI.StyledSubtitle level={2}>
        {formatter('bytesFormat')(clientStatistic?.userTrafficBytes)}
      </UI.StyledSubtitle >
    </>

  const LastSessionDuration = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'Last Session Duration' })}</UI.Title>
      <Subtitle level={2}>
        {formatter('durationFormat')(clientDetails?.timeConnectedMs
          ? convertEpochToRelativeTime(clientDetails?.timeConnectedMs)
          : (clientDetails?.sessionDuration
            ? clientDetails?.sessionDuration * 1000
            : 0))}
      </Subtitle>
    </>

  const Applications = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'Applications' })}</UI.Title>
      <Subtitle level={2}>{Math.floor(clientStatistic?.applications ?? 0)}</Subtitle>
    </>

  const AvgSessionLength = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'Avg. Session Length' })}</UI.Title>
      <Subtitle level={2}>
        {formatter('durationFormat')(clientStatistic?.avgSessionLengthSeconds)}
      </Subtitle>
    </>

  const Sessions = () =>
    <>
      <UI.Title>{$t({ defaultMessage: 'Sessions' })}</UI.Title>
      <Subtitle level={2}>{Math.floor(clientStatistic?.sessions ?? 0)}</Subtitle>
    </>

  const UserTrafficChart = () => <UserTraffic data={clientStatistic} />

  const ClientHealthChart = () =>
    <ClientHealth filter={filters} clientMac={clientDetails.clientMac}/>

  return <Card type='solid-bg'>
    <Loader states={[{
      isLoading: !Object.keys(clientStatistic ?? {}).length
        || !Object.keys(clientStatus).length
        || !Object.keys(clientDetails).length
    }]}>
      <Row justify='space-between' align='middle'>
        <Col span={4}>
          <Row style={{ flexDirection: 'column' }}>
            <Col><CurrentStatus /></Col>
            <Col><Applications /></Col>
          </Row>
        </Col>
        <Col span={3}>
          <Row style={{ flexDirection: 'column' }}>
            <Col><ApsConnected /></Col>
            <Col><AvgSessionLength /></Col>
          </Row>
        </Col>
        <Col span={3}>
          <Row style={{ flexDirection: 'column' }}>
            <Col><AvgRate /></Col>
            <Col><Sessions /></Col>
          </Row>
        </Col>
        <Col span={5}>
          <Row style={{ flexDirection: 'column' }}>
            <Col span={12}><UserTrafficWidget /></Col>
            <Col span={12}><UserTrafficChart /></Col>
          </Row>
        </Col>
        <Col span={5}>
          <Row style={{ flexDirection: 'column' }}>
            <Col span={12}><LastSessionDuration /></Col>
            <Col span={12}><ClientHealthChart /></Col>
          </Row>
        </Col>
      </Row>
    </Loader>
  </Card>
}
