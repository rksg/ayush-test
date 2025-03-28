import { useState } from 'react'

import { Space }   from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TimeSeriesDataType, TrendTypeEnum, aggregateDataBy, getSeriesData } from '@acx-ui/analytics/utils'
import { Loader, PageHeader, Table, TableProps, Tooltip,
  cssStr, Card, GridCol, GridRow, MultiLineTimeSeriesChart,
  NoData, Alert, TrendPill, Drawer } from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  EditOutlinedIcon,
  EditOutlinedDisabledIcon
} from '@acx-ui/icons'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { WifiScopes }            from '@acx-ui/types'
import {
  aiOpsApis,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import {
  DateFilter,
  DateRange,
  TABLE_DEFAULT_PAGE_SIZE,
  encodeParameter
} from '@acx-ui/utils'

import { zoomStatsThresholds }                                                                         from '../VideoCallQoe/constants'
import { useSearchClientsQuery, useUpdateCallQoeParticipantMutation, useVideoCallQoeTestDetailsQuery } from '../VideoCallQoe/services'
import { DetailedResponse, Participants, Client }                                                      from '../VideoCallQoe/types'

import { getConnectionQuality, getConnectionQualityTooltip } from './helper'
import * as UI                                               from './styledComponents'

export function VideoCallQoeDetails (){
  const intl= useIntl()
  const { $t } = intl
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
    if (!value) {
      return '-'
    }

    const isRA = get('IS_MLISA_SA')
    const apMac = row.apDetails?.apMac?.toUpperCase()
    let apID = isRA ? apMac : row.apDetails?.apSerial
    if (apID === 'Unknown') {
      apID = apMac
    }

    const { joinTime, leaveTime } = row
    const startDate = moment(joinTime).format()
    const endDate = moment(leaveTime).format()
    const callPeriod = encodeParameter<DateFilter>({
      startDate,
      endDate,
      range: DateRange.custom
    })

    const linkType = isRA ? 'ai' : 'overview'
    const link = `/devices/wifi/${apID}/details/${linkType}?period=${callPeriod}`

    return (
      <Tooltip title={$t({ defaultMessage: 'AP Details' })}>
        <TenantLink to={link}>
          {value as string}
        </TenantLink>
      </Tooltip>
    )
  }

  const columnHeaders: TableProps<Participants>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      width: 150,
      fixed: 'left',
      render: (_, row: Participants) => {
        const { macAddress, networkType, joinTime, leaveTime } = row
        const callPeriod = encodeParameter<DateFilter>({
          startDate: moment(joinTime).format(),
          endDate: moment(leaveTime).format(),
          range: DateRange.custom
        })

        const hasUpdateVideoCallQoePermission = hasCrossVenuesPermission() && hasPermission({
          permission: 'WRITE_VIDEO_CALL_QOE',
          scopes: [WifiScopes.UPDATE],
          rbacOpsIds: [aiOpsApis.updateVideoCallQoe]
        })

        if (networkType.toLowerCase() === 'wifi') {
          const link =
            `/users/wifi/clients/${macAddress}/details/troubleshooting?period=${callPeriod}`
          return (
            <Space>
              {
                row.macAddress
                  ? (<Tooltip title={$t({ defaultMessage: 'Client Troubleshooting' })}>
                    <TenantLink to={link}>
                      {macAddress.toUpperCase()}
                    </TenantLink>
                  </Tooltip>)
                  : (
                    <div style={{ width: '100px' }}>-</div>
                  )}
              {hasUpdateVideoCallQoePermission &&
              <Tooltip title={$t({ defaultMessage: 'Select Client MAC' })}>
                <EditOutlinedIcon
                  style={{ height: '16px', width: '16px', cursor: 'pointer' }}
                  onClick={() => {
                    setParticipantId(row.id)
                    setIsDrawerOpen(true)
                    setSelectedMac(null)
                  }}
                />
              </Tooltip>}
            </Space>
          )
        }

        return (
          <Space>
            <div style={{ width: '100px' }}>-</div>
            {hasUpdateVideoCallQoePermission &&
            <Tooltip title={$t({ defaultMessage: 'Not allowed as participant not on Wi-Fi' })}>
              <EditOutlinedDisabledIcon
                style={{ height: '16px', width: '16px', cursor: 'not-allowed' }}
              />
            </Tooltip>}
          </Space>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Participant' }),
      dataIndex: 'userName',
      key: 'userName'
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
      render: (_, { networkType }) => {
        return networkType.toLowerCase() === 'wifi' ? 'Wi-Fi' : networkType
      }
    },
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: ['apDetails','apName'],
      key: 'apName'
    },
    {
      title: $t({ defaultMessage: 'AP MAC' }),
      dataIndex: ['apDetails','apMac'],
      key: 'apMac',
      render: (_, row) => formatValue(row.apDetails?.apMac, row)
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: ['apDetails','ssid'],
      key: 'ssid',
      render: (_, { apDetails }) => {
        if(!apDetails?.ssid)
          return '-'
        return apDetails.ssid
      }
    },
    {
      title: $t({ defaultMessage: 'Radio' }),
      dataIndex: ['apDetails','radio'],
      key: 'radio',
      render: (_, { apDetails }) => {
        if(!apDetails?.radio)
          return '-'
        return `${apDetails.radio} Ghz`
      }
    },
    {
      title: $t({ defaultMessage: 'Join Time' }),
      dataIndex: 'joinTime',
      key: 'joinTime',
      render: (_, { joinTime })=>{
        return formatter(DateFormatEnum.OnlyTime)(joinTime)
      }
    },
    {
      title: $t({ defaultMessage: 'Leave Time' }),
      dataIndex: 'leaveTime',
      key: 'leaveTime',
      render: (_, row)=>{
        return <Tooltip
          title={row.leaveReason.replace('<br>','\n')}
          dottedUnderline={true}
        >
          {formatter(DateFormatEnum.OnlyTime)(row.leaveTime)}
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Connection Quality' }),
      dataIndex: 'wifiMetrics',
      key: 'quality',
      align: 'center',
      width: 150,
      render: (_, row) => {
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
          subTitle={[
            {
              label: $t({ defaultMessage: 'Start Time' }),
              value: [formatter(DateFormatEnum.DateTimeFormatWithSeconds)(currentMeeting.startTime)]
            },
            {
              label: $t({ defaultMessage: 'End Time' }),
              value: [formatter(DateFormatEnum.DateTimeFormatWithSeconds)(currentMeeting.endTime)]
            },
            {
              label: $t({ defaultMessage: 'Duration' }),
              value: [formatter('durationFormat')(new Date(currentMeeting.endTime).getTime()
                - new Date(currentMeeting.startTime).getTime())]
            }
          ]}
          extra={[
            <div style={{ paddingTop: '4px' }}>{$t({ defaultMessage: 'Video Call QoE' })}</div>,
            <div style={{ paddingTop: '4px' }}>{getPill(currentMeeting.mos)}</div>
          ]}
          breadcrumb={[
            ...(get('IS_MLISA_SA')
              ? [
                { text: $t({ defaultMessage: 'App Experience' }) }
              ]
              :[
                { text: $t({ defaultMessage: 'AI Assurance' }) },
                { text: $t({ defaultMessage: 'Network Assurance' }) }
              ]),
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
          settingsId='videoCallQoe-table'
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
                    title: 'MAC, Username, Hostname',
                    searchable: true,
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
                searchableWidth={230}
                onFilterChange={(_, { searchString }) => {
                  setSearch(searchString || '')
                  setSelectedMac(null)
                }}
                enableApiFilter
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
