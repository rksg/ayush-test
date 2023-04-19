import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import AutoSizer      from 'react-virtualized-auto-sizer'

import { TimeSeriesDataType, getSeriesData }                                                                                             from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow, Loader, MultiLineTimeSeriesChart, NoData, PageHeader, Table, TableProps, TrendPill, TrendType, cssStr } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                                     from '@acx-ui/formatter'
import { TenantLink, useParams }                                                                                                         from '@acx-ui/react-router-dom'

import { DetailedResponse, Participants, useVideoCallQoeTestDetailQuery } from '../VideoCallQoe/services'

import { getConnectionQuality } from './connectionQuality'
import { BigTrendPill, Title }  from './styledComponents'


export function VideoCallQoeDetails (){
  const { $t } = useIntl()
  const { testId } = useParams()
  const queryResults = useVideoCallQoeTestDetailQuery({ testId: Number(testId),status: 'ENDED' })
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
        // eslint-disable-next-line no-console
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
    return isValidMos ? (mos >= 4 ? <BigTrendPill value='Good' trend='positive' /> :
      <BigTrendPill value='Bad' trend='negative' />) : '-'
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

  const getSeries = (callQoeDetails: DetailedResponse['getAllCallQoeTests'][0],
    metricName: string, participantNumber: number, isVideoFrameRate = false) => {
    const data = callQoeDetails.meetings.at(0)?.participants.at(participantNumber)?.callMetrics
    const time: number[] = []
    const videoTx: (number | null)[] = []
    const videoRx: (number | null)[] = []
    const audioTx: (number | null)[] = []
    const audioRx: (number | null)[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.forEach((metric: Record<string, any> ) => {
      const dateTime = new Date(metric.date_time).valueOf()
      time.push(dateTime)
      if(isVideoFrameRate) {
        videoTx.push(metric[metricName].tx)
        videoRx.push(metric[metricName].rx)
      } else {
        videoTx.push(metric[metricName].video?.tx)
        videoRx.push(metric[metricName].video?.rx)
        audioTx.push(metric[metricName].audio?.tx)
        audioRx.push(metric[metricName].audio?.tx)
      }
    })
    if(isVideoFrameRate){
      let finaldit = {
        time: time,
        videoTx: videoTx,
        videoRx: videoRx
      }
      finaldit.time = time
      finaldit.videoTx = videoTx
      finaldit.videoRx = videoRx
      let videoSeriesMapping: { key: string; name: string }[] = []
      seriesMapping.map(metric => {
        if(metric.key === 'videoTx' || metric.key === 'videoRx') {
          videoSeriesMapping.push(metric)
        }
        return videoSeriesMapping
      })
      const chartResults = getSeriesData(
        finaldit as Record<string, TimeSeriesDataType[]>, videoSeriesMapping)
      return chartResults
    }
    else {
      let finaldit = {
        time: time,
        videoTx: videoTx,
        videoRx: videoRx,
        audioTx: audioTx,
        audioRx: audioRx
      }
      finaldit.time = time
      finaldit.videoTx = videoTx
      finaldit.videoRx = videoRx
      finaldit.audioRx = audioRx
      finaldit.audioTx = audioTx
      const chartResults = getSeriesData(
        finaldit as Record<string, TimeSeriesDataType[]>, seriesMapping)
      return chartResults
    }
  }

  const getParticipantName = (callQoeDetails: DetailedResponse['getAllCallQoeTests'][0],
    participantNumber: number) => {
    let participantName =
    callQoeDetails.meetings.at(0)?.participants.at(participantNumber)?.userName
    return participantName
  }

  return (
    <Loader states={[queryResults]}>
      {callQoeDetails && currentMeeting && <>
        <PageHeader
          title={callQoeDetails.name}
          subTitle={`Start Time: ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)
          (currentMeeting.startTime)}` +
        ` | End Time: ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)
        (currentMeeting.endTime)}` +
    ` | Duration: ${formatter('durationFormat')
    (new Date(currentMeeting.endTime).getTime()
    - new Date(currentMeeting.startTime).getTime())}`
          }
          extra={[
            <>{$t({ defaultMessage: 'Video Call QOE' })}</>,
            <>{getPill(currentMeeting.mos)}</>
          ]} />
        <Typography.Text style={{
          fontSize: cssStr('--acx-body-2-font-size'),
          fontWeight: cssStr('--acx-body-font-weight-bold'),
          fontFamily: cssStr('--acx-accent-brand-font'),
          lineHeight: cssStr('--acx-body-3-line-height')
        }}>{$t({ defaultMessage: 'Participant Details' })}</Typography.Text>
        <Table
          columns={columnHeaders}
          dataSource={participants}
        />
      </>}
      {callQoeDetails &&
      <Card title={$t({ defaultMessage: 'Zoom Call Statistics' })} type='no-border'>
        <GridRow>
          <GridCol col={{ span: 11 }} style={{ height: '280px' }}>
            <>{getParticipantName(callQoeDetails,0)}</>
            <Title>{$t({ defaultMessage: 'Jitter' })}</Title>
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
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <>{getParticipantName(callQoeDetails,1)}</>
            <Title></Title>
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
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title>{$t({ defaultMessage: 'Latency' })}</Title>
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
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title></Title>
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
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title>{$t({ defaultMessage: 'Packet Loss' })}</Title>
            <AutoSizer>
              {({ height, width }) => (
                getSeries(callQoeDetails, 'packet_loss', 0).length ?
                  <MultiLineTimeSeriesChart
                    style={{ width: width, height }}
                    data={getSeries(callQoeDetails, 'packet_loss', 0)}
                    dataFormatter={formatter('percentFormat')}
                  />
                  : <NoData/>
              )}
            </AutoSizer>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title></Title>
            <AutoSizer>
              {({ height, width }) => (
                getSeries(callQoeDetails, 'packet_loss', 1).length ?
                  <MultiLineTimeSeriesChart
                    style={{ width: width, height }}
                    data={getSeries(callQoeDetails, 'packet_loss', 1)}
                    dataFormatter={formatter('percentFormat')}
                  />
                  : <NoData/>
              )}
            </AutoSizer>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title>{$t({ defaultMessage: 'Video Frame Rate' })}</Title>
            <AutoSizer>
              {({ height, width }) => (
                getSeries(callQoeDetails, 'video_frame_rate', 0, true).length ?
                  <MultiLineTimeSeriesChart
                    style={{ width: width, height }}
                    data={getSeries(callQoeDetails, 'video_frame_rate', 0, true)}
                    dataFormatter={formatter('fps')}
                  />
                  : <NoData/>
              )}
            </AutoSizer>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title></Title>
            <AutoSizer>
              {({ height, width }) => (
                getSeries(callQoeDetails, 'video_frame_rate', 1, true).length ?
                  <MultiLineTimeSeriesChart
                    style={{ width: width, height }}
                    data={getSeries(callQoeDetails, 'video_frame_rate', 1, true)}
                    dataFormatter={formatter('fps')}
                  />
                  : <NoData/>
              )}
            </AutoSizer>
          </GridCol>
        </GridRow>
      </Card>
      }
    </Loader>
  )
}