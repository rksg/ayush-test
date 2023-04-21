import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TimeSeriesDataType, getSeriesData } from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow,
  Loader, MultiLineTimeSeriesChart,
  NoData, PageHeader, Table,
  TableProps, TrendPill, TrendType } from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { TenantLink, useParams }     from '@acx-ui/react-router-dom'

import { DetailedResponse, Participants, useVideoCallQoeTestDetailsQuery } from '../VideoCallQoe/services'

import { getConnectionQuality } from './connectionQuality'
import * as UI                  from './styledComponents'


export function VideoCallQoeDetails (){
  const { $t } = useIntl()
  const { testId } = useParams()
  const queryResults = useVideoCallQoeTestDetailsQuery({ testId: Number(testId),status: 'ENDED' })
  const callQoeDetails = queryResults.data?.getAllCallQoeTests.at(0)
  const currentMeeting = callQoeDetails?.meetings.at(0)
  const participants = currentMeeting?.participants
  const columnHeaders: TableProps<Participants>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'macAddress',
      key: 'macAddress'
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
      key: 'networkType'
    },
    {
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: ['apDetails','apName'],
      key: 'apName',
      render: (value:unknown)=>{
        return <TenantLink to={'/devices/wifi'}>{value as string}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'AP MAC' }),
      dataIndex: ['apDetails','apMac'],
      key: 'apMac',
      render: (value:unknown)=>{
        return <TenantLink to={'/devices/wifi'}>{value as string}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: ['apDetails','ssid'],
      key: 'ssid',
      render: (value:unknown)=>{
        return <TenantLink to={'/networks/wireless'}>{value as string}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Radio' }),
      dataIndex: ['apDetails','radio'],
      key: 'radio',
      render: (value:unknown)=>{
        if(value){
          return `${value} Ghz`
        }
        return ''
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
      render: (value:unknown)=>{
        return formatter(DateFormatEnum.OnlyTime)(value as string)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Connection Quality' }),
      dataIndex: 'wifiMetrics',
      key: 'quality',
      align: 'center',
      width: 150,
      render: (value:unknown)=>{
        const wifiMetrics = value as {
          rss: number
          snr: number
          avgTxMCS: number
          throughput: number
        } | null
        const connectionQuality = getConnectionQuality(wifiMetrics)
        if(connectionQuality){
          let [trend,quality] = ['none','Average']
          if(connectionQuality === 'bad')
            [trend,quality]=['negative','Bad']
          else if(connectionQuality === 'good')
            [trend,quality]=['positive','Good']
          return <TrendPill value={quality} trend={trend as TrendType} />
        }
        else
          return ''
      }
    }
  ]
  const getPill = (mos:number)=>{
    const isValidMos = mos ? true : false
    return isValidMos ? (mos >= 4 ? <UI.BigTrendPill value='Good' trend='positive' /> :
      <UI.BigTrendPill value='Bad' trend='negative' />) : '-'
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
    participantNumber: number, isVideoFrameRate = false
  ) => {
    const data = callQoeDetails.meetings.at(0)?.participants.at(participantNumber)?.callMetrics
    const time: number[] = []
    const videoTx: (number | null)[] = []
    const videoRx: (number | null)[] = []
    const audioTx: (number | null)[] = []
    const audioRx: (number | null)[] = []

    data?.forEach((metric: Participants['callMetrics'][0] ) => {
      time.push(new Date(metric.date_time).valueOf())

      if(isVideoFrameRate) {
        videoTx.push(metric.video_frame_rate.tx)
        videoRx.push(metric.video_frame_rate.rx)
      } else if (metricName !== 'video_frame_rate') {
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
            <>{$t({ defaultMessage: 'Video Call QoE' })}</>,
            <>{getPill(currentMeeting.mos)}</>
          ]} />
        <UI.ReportSectionTitle>
          {$t({ defaultMessage: 'Participant Details' })}
        </UI.ReportSectionTitle>
        <Table
          columns={columnHeaders}
          dataSource={participants}
        />
      </>}
      {callQoeDetails &&
        <UI.CharsContainer>
          <UI.ReportSectionTitle style={{ padding: '10px 0px' }}>
            {$t({ defaultMessage: 'Zoom Call Statistics' })}
          </UI.ReportSectionTitle>
          <GridRow>
            <GridCol col={{ span: 12 }}>
              <UI.Label>Participant 1: </UI.Label>
              <UI.Value>{getParticipantName(callQoeDetails,0)}</UI.Value>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <UI.Label>Participant 2: </UI.Label>
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
                    getSeries(callQoeDetails, 'video_frame_rate', 0, true).length ?
                      <MultiLineTimeSeriesChart
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'video_frame_rate', 0, true)}
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
                    getSeries(callQoeDetails, 'video_frame_rate', 1, true).length ?
                      <MultiLineTimeSeriesChart
                        style={{ width: width, height }}
                        data={getSeries(callQoeDetails, 'video_frame_rate', 1, true)}
                        dataFormatter={formatter('fpsFormat')}
                      />
                      : <NoData/>
                  )}
                </AutoSizer>
              </Card>
            </GridCol>
          </GridRow>
        </UI.CharsContainer>
      }
    </Loader>
  )
}