import { useState } from 'react'

import { Space }   from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TimeSeriesDataType, TrendTypeEnum, aggregateDataBy, getSeriesData } from '@acx-ui/analytics/utils'
import { Loader, PageHeader, Table, TableProps, Tooltip,
  cssStr,  Card, GridCol, GridRow,
  MultiLineTimeSeriesChart,NoData, Alert, TrendPill,
  Drawer, SearchBar }                from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  EditOutlinedIcon,
  EditOutlinedDisabledIcon
} from '@acx-ui/icons'
import { TenantLink, useParams }   from '@acx-ui/react-router-dom'
import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'

import { zoomStatsThresholds }                                                                         from '../VideoCallQoe/constants'
import { useSearchClientsQuery, useUpdateCallQoeParticipantMutation, useVideoCallQoeTestDetailsQuery } from '../VideoCallQoe/services'
import { DetailedResponse, Participants, Client }                                                      from '../VideoCallQoe/types'

import { getConnectionQuality, getConnectionQualityTooltip } from './helper'
import * as UI                                               from './styledComponents'

export function VideoCallQoeDetails (){
  const intl= useIntl()
  const { $t } = intl
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const { testId } = useParams()
  const [isDrawerOpen,setIsDrawerOpen] = useState(false)
  const [participantId,setParticipantId] = useState<number|null>(null)
  const [selectedMac,setSelectedMac] = useState<string|null>(null)
  const queryResults = useVideoCallQoeTestDetailsQuery({ testId: Number(testId),status: 'ENDED' })
  const callQoeDetails = queryResults.data?.getAllCallQoeTests.at(0)
  const currentMeeting = callQoeDetails?.meetings.at(0)
  const participants = currentMeeting?.participants
  const [ updateParticipant ] = useUpdateCallQoeParticipantMutation()

  const isMissingClientMac = (participants:Participants[])=>{
    const missingMacCount = participants
      .filter(participant=>
        !participant.macAddress && participant.networkType.toLowerCase() === 'wifi').length
    return missingMacCount > 0
  }

  const [ search, setSearch ] = useState('')
  const searchQueryResults = useSearchClientsQuery({
    start: moment(currentMeeting? currentMeeting.startTime: moment()).format(),
    end: moment(currentMeeting? currentMeeting.endTime: moment()).format(),
    query: search,
    limit: 100
  }, { selectFromResult: (states) => ({
    ...states,
    data: states.data && aggregateDataBy<Client>('mac')(states.data).map( client => {
      return {
        hostname: client.hostname[0],
        mac: client.mac[0],
        username: client.username[0]
      }
    })
  }) })

  const formatValue = (value: unknown, row: Participants) => {
    if (!value)
      return '-'
    let apID = row.apDetails?.apSerial
    if ( apID === 'Unknown') {
      apID = row.apDetails?.apMac?.toUpperCase()
    }
    return <TenantLink
      to={`/devices/wifi/${apID}/details/overview`}>
      {value as string}</TenantLink>
  }

  const columnHeaders: TableProps<Participants>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (_, row)=>{
        if(row.networkType.toLowerCase() === 'wifi'){
          return <Space>
            {row.macAddress ? <span>{row.macAddress.toUpperCase()}</span>
              : <div style={{ width: '100px' }}>-</div>}
            <Tooltip title={$t({ defaultMessage: 'Select Client MAC' })}>
              <EditOutlinedIcon style={{ height: '16px', width: '16px', cursor: 'pointer' }}
                onClick={()=>{
                  setParticipantId(row.id)
                  setIsDrawerOpen(true)
                  setSelectedMac(null)
                }}/>
            </Tooltip>
          </Space>
        }
        return <Space>
          <div style={{ width: '100px' }}>-</div>
          <Tooltip title={$t({ defaultMessage: 'Not allowed as participant not on Wi-Fi' })}>
            <EditOutlinedDisabledIcon
              style={{ height: '16px', width: '16px', cursor: 'not-allowed' }} />
          </Tooltip>
        </Space>
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
      render: (_, { networkType })=>{
        return networkType.toLowerCase() === 'wifi' ? 'Wi-Fi' : networkType
      }
    },
    {
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: ['apDetails','apName'],
      key: 'apName',
      render: (_, row)=>formatValue(row.apDetails?.apName, row)
    },
    {
      title: $t({ defaultMessage: 'AP MAC' }),
      dataIndex: ['apDetails','apMac'],
      key: 'apMac',
      render: (_, row)=>formatValue(row.apDetails?.apMac, row)
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: ['apDetails','ssid'],
      key: 'ssid',
      render: (_, { apDetails })=>{
        if(!apDetails?.ssid)
          return '-'
        return apDetails.ssid
      }
    },
    {
      title: $t({ defaultMessage: 'Radio' }),
      dataIndex: ['apDetails','radio'],
      key: 'radio',
      render: (_, { apDetails })=>{
        if(!apDetails?.radio)
          return '-'
        return `${apDetails.radio} Ghz`
      }
    },
    {
      title: $t({ defaultMessage: 'Join Time' }),
      dataIndex: 'joinTime',
      key: 'joinTime',
      align: 'center',
      width: 50,
      render: (_, { joinTime })=>{
        return formatter(DateFormatEnum.OnlyTime)(joinTime)
      }
    },
    {
      title: $t({ defaultMessage: 'Leave Time' }),
      dataIndex: 'leaveTime',
      key: 'leaveTime',
      align: 'center',
      width: 50,
      render: (_, row)=>{
        return <Tooltip title={row.leaveReason.replace('<br>','\n')}>
          {formatter(DateFormatEnum.OnlyTime)(row.leaveTime)}</Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Connection Quality' }),
      dataIndex: 'wifiMetrics',
      key: 'quality',
      align: 'center',
      width: 150,
      render: (_, row)=>{
        if(row.networkType.toLowerCase() !== 'wifi'){
          return $t({ defaultMessage: 'NA' })
        }
        const wifiMetrics = row.wifiMetrics || null
        const connectionQuality = getConnectionQuality(wifiMetrics)
        const connectionQualityTooltip = getConnectionQualityTooltip(wifiMetrics, intl)

        if(connectionQuality){
          let [trend,quality] = [TrendTypeEnum.None, $t({ defaultMessage: 'Average' })]
          if(connectionQuality === 'bad')
            [trend,quality]=[TrendTypeEnum.Negative, $t({ defaultMessage: 'Bad' })]
          else if(connectionQuality === 'good')
            [trend,quality]=[TrendTypeEnum.Positive, $t({ defaultMessage: 'Good' })]

          return <Tooltip title={connectionQualityTooltip}>
            <TrendPill value={quality} trend={trend} />
          </Tooltip>
        }
        else
          return '-'
      }
    }
  ]
  const getPill = (mos:number)=>{
    return mos >= 4 ? <UI.BigTrendPill
      value={$t({ defaultMessage: 'Good' })}
      trend={TrendTypeEnum.Positive} /> :
      <UI.BigTrendPill
        value={$t({ defaultMessage: 'Bad' })}
        trend={TrendTypeEnum.Negative} />
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

  const onCancelClientMac = ()=>{
    setSelectedMac(null)
    setSearch('')
    setIsDrawerOpen(false)
  }
  const onSelectClientMac = async ()=>{
    if(participantId && selectedMac){
      await updateParticipant({ participantId, macAddr: selectedMac }).unwrap()
      queryResults.refetch()
      setIsDrawerOpen(false)
      setSearch('')
    }
  }
  return (
    <>
      <Loader states={[queryResults]}>
        { callQoeDetails && currentMeeting && <PageHeader
          title={callQoeDetails.name}
          subTitle={
            `${$t({ defaultMessage: 'Start Time' })}:
            ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)(currentMeeting.startTime)}` +
            ` | ${$t({ defaultMessage: 'End Time' })}:
            ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)(currentMeeting.endTime)}` +
            ` | ${$t({ defaultMessage: 'Duration' })}:
            ${formatter('durationFormat')(new Date(currentMeeting.endTime).getTime()
              - new Date(currentMeeting.startTime).getTime())}`
          }
          extra={[
            <div style={{ paddingTop: '4px' }}>{$t({ defaultMessage: 'Video Call QoE' })}</div>,
            <div style={{ paddingTop: '4px' }}>{getPill(currentMeeting.mos)}</div>
          ]}
          breadcrumb={[
            ...(isNavbarEnhanced ? [
              { text: $t({ defaultMessage: 'AI Assurance' }) },
              { text: $t({ defaultMessage: 'Network Assurance' }) }
            ]:[]),
            {
              text: $t({ defaultMessage: 'Video Call QoE' }),
              link: '/analytics/videoCallQoe'
            }
          ]}
        />}
      </Loader>
      <Loader states={[queryResults]}>
        <UI.ReportSectionTitle>
          {$t({ defaultMessage: 'Participant Details' })}
        </UI.ReportSectionTitle>
        {
          participants && isMissingClientMac(participants as Participants[]) &&
          <div style={{ marginTop: '10px' }}>
            <Alert
              message={$t({
              // eslint-disable-next-line max-len
                defaultMessage: 'To see the details of Wi-Fi Connection Quality, you must select "Client MAC" for participants'
              })}
              type='warning'
              showIcon />
          </div>
        }
        <Table
          rowKey='id'
          columns={columnHeaders}
          dataSource={participants}
        />
      </Loader>
      { isDrawerOpen &&
          <Drawer
            width={400}
            visible={isDrawerOpen}
            title={$t({ defaultMessage: 'Select Client MAC' })}
            onClose={onCancelClientMac}
            footer={<Drawer.FormFooter showAddAnother={false}
              buttonLabel={({
                save: $t({ defaultMessage: 'Select' })
              })}
              showSaveButton={selectedMac!= null}
              onCancel={onCancelClientMac}
              onSave={onSelectClientMac}
            />}
          >
            <SearchBar
              placeHolder='Search by MAC, username or hostname'
              onChange={(q) => q?.trim().length>=0 && _.debounce(
                (search) => {
                  setSearch(search)
                  setSelectedMac(null)
                }
                ,1000
              )(q.trim())}
            />
            <Loader states={[searchQueryResults]}>
              <Table
                rowKey='mac'
                rowSelection={
                  { type: 'radio',
                    selectedRowKeys: selectedMac ? [selectedMac] : [],
                    onChange: (keys)=>{
                      if(keys.length){
                        setSelectedMac(keys[0] as string)
                      }else{
                        setSelectedMac(null)
                      }
                    } }}
                showHeader={false}
                columns={[
                  {
                    dataIndex: 'mac',
                    key: 'mac',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render: (_, row: any)=>{
                      return <>
                        <GridRow>
                          <GridCol col={{ span: 24 }}><strong>{row.mac}</strong></GridCol>
                        </GridRow>
                        <GridRow>
                          <GridCol col={{ span: 8 }}>
                            {$t({ defaultMessage: 'Username' })}:</GridCol>
                          <GridCol col={{ span: 16 }}>{row.username}</GridCol>
                        </GridRow>
                        <GridRow>
                          <GridCol col={{ span: 8 }}>
                            {$t({ defaultMessage: 'Hostname' })}:</GridCol>
                          <GridCol col={{ span: 16 }}>{row.hostname}</GridCol>
                        </GridRow>
                      </>
                    }
                  }
                ]}
                dataSource={searchQueryResults.data}
                pagination={{
                  pageSize: TABLE_DEFAULT_PAGE_SIZE,
                  defaultPageSize: TABLE_DEFAULT_PAGE_SIZE
                }}
              />
            </Loader>
          </Drawer>
      }
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
    </>
  )
}
