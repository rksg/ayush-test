
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TimeSeriesDataType, getSeriesData }                                            from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow, Loader, MultiLineTimeSeriesChart, NoData, PageHeader } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                    from '@acx-ui/formatter'
import { useParams }                                                                    from '@acx-ui/react-router-dom'

import { DetailedResponse, useVideoCallQoeTestDetailQuery } from '../VideoCallQoe/services'

import { BigTrendPill, Title } from './styledComponents'


export function VideoCallQoeDetails (){
  const { $t } = useIntl()
  const { testId } = useParams()
  const queryResults = useVideoCallQoeTestDetailQuery({ testId: Number(testId),status: 'ENDED' })
  const callQoeDetails = queryResults.data?.getAllCallQoeTests.at(0)
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
    // Participants['callMetrics'][0]
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
      const chartResults = getSeriesData(
        finaldit as Record<string, TimeSeriesDataType[]>, seriesMapping.splice(0,2))
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

  return (
    <Loader states={[queryResults]}>
      {callQoeDetails && <PageHeader
        title={callQoeDetails.name}
        subTitle={`Start Time: ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)
        (callQoeDetails.meetings[0].startTime)}` +
        ` | End Time: ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)
        (callQoeDetails.meetings[0].endTime)}` +
    ` | Duration: ${formatter('durationFormat')
    (new Date(callQoeDetails.meetings[0].endTime).getTime()
    - new Date(callQoeDetails.meetings[0].startTime).getTime())}`
        }
        extra={[
          <>{$t({ defaultMessage: 'Video Call QOE' })}</>,
          <>{getPill(callQoeDetails.meetings[0].mos)}</>
        ]}
      />}
      {callQoeDetails &&
      <Card title={$t({ defaultMessage: 'Zoom Call Statistics' })} type='no-border'>
        <GridRow>
          <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
            <Title>{$t({ defaultMessage: 'Jitter' })}</Title>
            <AutoSizer>
              {({ height, width }) => (
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
            <Title></Title>
            <AutoSizer>
              {({ height, width }) => (
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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
                // call helper function
                callQoeDetails.meetings[0].participants[0].callMetrics.length ?
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