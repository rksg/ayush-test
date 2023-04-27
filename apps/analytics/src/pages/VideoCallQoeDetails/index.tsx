import { useEffect } from 'react'

import { Space, Typography } from 'antd'
import { connect }           from 'echarts'
import ReactECharts          from 'echarts-for-react'
import { useIntl }           from 'react-intl'
import AutoSizer             from 'react-virtualized-auto-sizer'

import { TimeSeriesDataType, getSeriesData }                                                                                                              from '@acx-ui/analytics/utils'
import { Loader, PageHeader, Table, TableProps, Tooltip, TrendPill, TrendType, cssStr,  Card, GridCol, GridRow, MultiLineTimeSeriesChart, NoData, Alert } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                                                      from '@acx-ui/formatter'
import {
  EditOutlinedIcon
} from '@acx-ui/icons'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'


import { DetailedResponse, Participants, WifiMetrics, useVideoCallQoeTestDetailsQuery } from '../VideoCallQoe/services'

import { getConnectionQuality, getConnectionQualityTooltip, zoomStatsThresholds } from './connectionQuality'
import * as UI                                                                    from './styledComponents'

export function VideoCallQoeDetails (){
  const intl= useIntl()
  const { $t } = intl
  const { testId } = useParams()
  const queryResults = useVideoCallQoeTestDetailsQuery({ testId: Number(testId),status: 'ENDED' })
  const callQoeDetails = queryResults.data?.getAllCallQoeTests.at(0)
  const currentMeeting = callQoeDetails?.meetings.at(0)
  const participants = currentMeeting?.participants

  // Connect charts
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'group'
    }
  }
  useEffect(() => { connect('group') }, [])

  const isMissingClientMac = (participants:Participants[])=>{
    const missingMacCount = participants
      .filter(participant=>
        !participant.macAddress && participant.networkType.toLowerCase() === 'wifi').length
    return missingMacCount > 0
  }

  const columnHeaders: TableProps<Participants>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (value:unknown, row:Participants)=>{
        if(row.networkType.toLowerCase() === 'wifi'){
          return <Space>
            {value ? <span>{value as string}</span> : <div style={{ width: '100px' }}>-</div>}
            <EditOutlinedIcon style={{ height: '16px', width: '16px' }} />
          </Space>
        }
        return '-'
      }
    },
    {
      title: $t({ defaultMessage: 'Participant' }),
      dataIndex: 'userName',
      key: 'userName',
      width: 200
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    },
    {
      title: $t({ defaultMessage: 'Network Type' }),
      dataIndex: 'networkType',
      key: 'networkType',
      width: 100,
      render: (value:unknown)=>{
        return (value as string).toLowerCase() === 'wifi' ? 'Wi-Fi' : value as string
      }
    },
    {
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: ['apDetails','apName'],
      key: 'apName',
      render: (value:unknown)=>{
        if(!value)
          return '-'
        return <TenantLink to={'/devices/wifi'}>{value as string}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'AP MAC' }),
      dataIndex: ['apDetails','apMac'],
      key: 'apMac',
      render: (value:unknown)=>{
        if(!value)
          return '-'
        return <TenantLink to={'/devices/wifi'}>{value as string}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: ['apDetails','ssid'],
      key: 'ssid',
      render: (value:unknown)=>{
        if(!value)
          return '-'
        return <TenantLink to={'/networks/wireless'}>{value as string}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Radio' }),
      dataIndex: ['apDetails','radio'],
      key: 'radio',
      render: (value:unknown)=>{
        if(!value)
          return '-'
        return `${value} Ghz`
      }
    },
    {
      title: $t({ defaultMessage: 'Join Time' }),
      dataIndex: 'joinTime',
      key: 'joinTime',
      align: 'center',
      width: 50,
      render: (value:unknown)=>{
        return formatter(DateFormatEnum.OnlyTime)(value as string)
      }
    },
    {
      title: $t({ defaultMessage: 'Leave Time' }),
      dataIndex: 'leaveTime',
      key: 'leaveTime',
      align: 'center',
      width: 50,
      render: (value:unknown,row:Participants)=>{
        return <Tooltip title={row.leaveReason.replace('<br>','\n')}>
          {formatter(DateFormatEnum.OnlyTime)(value as string)}</Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Connection Quality' }),
      dataIndex: 'wifiMetrics',
      key: 'quality',
      align: 'center',
      width: 150,
      render: (value:unknown)=>{
        const wifiMetrics = value as WifiMetrics | null
        const connectionQuality = getConnectionQuality(wifiMetrics)
        const connectionQualityTooltip = getConnectionQualityTooltip(wifiMetrics, intl)

        if(connectionQuality){
          let [trend,quality] = ['none', $t({ defaultMessage: 'Average' })]
          if(connectionQuality === 'bad')
            [trend,quality]=['negative', $t({ defaultMessage: 'Bad' })]
          else if(connectionQuality === 'good')
            [trend,quality]=['positive', $t({ defaultMessage: 'Good' })]

          return <Tooltip title={connectionQualityTooltip}>
            <TrendPill value={quality} trend={trend as TrendType} />
          </Tooltip>
        }
        else
          return '-'
      }
    }
  ]
  const getPill = (mos:number)=>{
    return mos >= 4 ? <UI.BigTrendPill value='Good' trend='positive' /> :
      <UI.BigTrendPill value='Bad' trend='negative' />
  }

  const seriesMapping = [{
    key: 'videoTx',
    name: $t({ defaultMessage: 'Video Tx' })
  },
  {
    key: 'videoRx',
    name: $t({ defaultMessage: 'Video Rx' })
  },
  {
    key: 'audioTx',
    name: $t({ defaultMessage: 'Audio Tx' })
  },
  {
    key: 'audioRx',
    name: $t({ defaultMessage: 'Audio Rx' })
  }]

  const getSeries = (
    callQoeDetails: DetailedResponse['getAllCallQoeTests'][0],
    metricName: Exclude<keyof Participants['callMetrics'][0], 'date_time'>,
    participantNumber: number) => {
    const data = callQoeDetails.meetings.at(0)?.participants.at(participantNumber)?.callMetrics
    const time: number[] = []
    const videoTx: (number | null)[] = []
    const videoRx: (number | null)[] = []
    const audioTx: (number | null)[] = []
    const audioRx: (number | null)[] = []

    const isVideoFrameRate = metricName === 'video_frame_rate'
    data?.forEach((metric: Participants['callMetrics'][0] ) => {
      time.push(new Date(metric.date_time).valueOf())

      if(isVideoFrameRate) {
        videoTx.push(metric.video_frame_rate.tx)
        videoRx.push(metric.video_frame_rate.rx)
      } else {
        videoTx.push(metric[metricName].video.tx)
        videoRx.push(metric[metricName].video.rx)
        audioTx.push(metric[metricName].audio.tx)
        audioRx.push(metric[metricName].audio.rx)
      }
    })

    if(isVideoFrameRate){
      const data = {
        time,
        videoTx,
        videoRx
      }
      const videoSeriesMapping: { key: string; name: string }[] = []
      seriesMapping.map(metric => {
        if(metric.key === 'videoTx' || metric.key === 'videoRx') {
          videoSeriesMapping.push(metric)
        }
        return videoSeriesMapping
      })
      const chartResults = getSeriesData(
        data as Record<string, TimeSeriesDataType[]>, videoSeriesMapping)
      return chartResults
    }
    else {
      const data = {
        time,
        videoTx,
        videoRx,
        audioTx,
        audioRx
      }
      const chartResults = getSeriesData(
        data as Record<string, TimeSeriesDataType[]>, seriesMapping)
      return chartResults
    }
  }

  const getParticipantName = (
    callQoeDetails: DetailedResponse['getAllCallQoeTests'][0],
    participantNumber: number) =>
    callQoeDetails.meetings.at(0)?.participants.at(participantNumber)?.userName

  return (
    <Loader states={[queryResults]}>
      {callQoeDetails && currentMeeting && <>
        <PageHeader
          title={callQoeDetails.name}
          subTitle={
            `Start Time:
            ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)(currentMeeting.startTime)}` +
            ` | End Time:
            ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)(currentMeeting.endTime)}` +
            ` | Duration:
            ${formatter('durationFormat')(new Date(currentMeeting.endTime).getTime()
              - new Date(currentMeeting.startTime).getTime())}`
          }
          extra={[
            <div style={{ paddingTop: '4px' }}>{$t({ defaultMessage: 'Video Call QoE' })}</div>,
            <div style={{ paddingTop: '4px' }}>{getPill(currentMeeting.mos)}</div>
          ]}
          breadcrumb={[{
            text: $t({ defaultMessage: 'Video Call QoE' }),
            link: '/serviceValidation/videoCallQoe'
          }]}
        />
        <Typography.Text style={{
          fontSize: cssStr('--acx-body-2-font-size'),
          fontWeight: cssStr('--acx-body-font-weight-bold'),
          fontFamily: cssStr('--acx-accent-brand-font'),
          lineHeight: cssStr('--acx-body-3-line-height')
        }}>{$t({ defaultMessage: 'Participant Details' })}</Typography.Text>

        {isMissingClientMac(participants as Participants[]) &&
        <div style={{ marginTop: '10px' }}><Alert
          message={$t({
            // eslint-disable-next-line max-len
            defaultMessage: 'To see the details of Video Call QoE, you must select "Client MAC" for participants'
          })}
          type='warning'
          showIcon /></div> }

        <Table
          columns={columnHeaders}
          dataSource={participants}
        />
      </>}
      {callQoeDetails &&
        <UI.ChartsContainer>
          <UI.ReportSectionTitle style={{ padding: '15px 0px' }}>
            {$t({ defaultMessage: 'Zoom Call Statistics' })}
          </UI.ReportSectionTitle>
          <GridRow>
            <GridCol col={{ span: 12 }}>
              <UI.Label>{$t({ defaultMessage: 'Participant 1' })}</UI.Label>
              <UI.Value>{getParticipantName(callQoeDetails,0)}</UI.Value>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <UI.Label>{$t({ defaultMessage: 'Participant 2' })}</UI.Label>
              <UI.Value>{getParticipantName(callQoeDetails,1)}</UI.Value>
            </GridCol>
            <GridCol col={{ span: 24 }}>
              <Card.Title>{$t({ defaultMessage: 'Jitter' })}</Card.Title>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'jitter', 0).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: zoomStatsThresholds.JITTER,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.JITTER,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'jitter', 0)}
                        dataFormatter={formatter('durationFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'jitter', 1).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: zoomStatsThresholds.JITTER,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.JITTER,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'jitter', 1)}
                        dataFormatter={formatter('durationFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 24 }}>
              <Card.Title>{$t({ defaultMessage: 'Latency' })}</Card.Title>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'latency', 0).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: zoomStatsThresholds.LATENCY,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.LATENCY,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'latency', 0)}
                        dataFormatter={formatter('durationFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'latency', 1).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: zoomStatsThresholds.LATENCY,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.LATENCY,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'latency', 1)}
                        dataFormatter={formatter('durationFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 24 }}>
              <Card.Title>{$t({ defaultMessage: 'Packet Loss' })}</Card.Title>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'packet_loss', 0).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: zoomStatsThresholds.PACKET_LOSS,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.PACKET_LOSS,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'packet_loss', 0)}
                        dataFormatter={formatter('percent')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'packet_loss', 1).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: zoomStatsThresholds.PACKET_LOSS,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.PACKET_LOSS,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'packet_loss', 1)}
                        dataFormatter={formatter('percent')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 24 }}>
              <Card.Title>{$t({ defaultMessage: 'Video Frame Rate' })}</Card.Title>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'video_frame_rate', 0).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: 0,
                          end: zoomStatsThresholds.VIDEO_FRAME_RATE,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.VIDEO_FRAME_RATE,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'video_frame_rate', 0)}
                        dataFormatter={formatter('fpsFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
              <Card>
                <AutoSizer>
                  {({ height, width }) => (
                    getSeries(callQoeDetails, 'video_frame_rate', 1).length ?
                      <MultiLineTimeSeriesChart
                        chartRef={connectChart}
                        markerAreas={[{
                          start: 0,
                          end: zoomStatsThresholds.VIDEO_FRAME_RATE,
                          itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        markerLines={[{
                          threshold: zoomStatsThresholds.VIDEO_FRAME_RATE,
                          lineStyle: { opacity: 0.5, color: cssStr('--acx-semantics-red-50') }
                        }]}
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'video_frame_rate', 1)}
                        dataFormatter={formatter('fpsFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
          </GridRow>
        </UI.ChartsContainer>
      }
    </Loader>
  )
}
