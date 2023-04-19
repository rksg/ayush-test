import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Loader, PageHeader, Table, TableProps, TrendPill, TrendType, cssStr } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                           from '@acx-ui/formatter'
import { TenantLink, useParams }                                               from '@acx-ui/react-router-dom'

import { Participants, useVideoCallQoeTestDetailsQuery } from '../VideoCallQoe/services'

import { getConnectionQuality } from './connectionQuality'
import { BigTrendPill }         from './styledComponents'


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
    return mos >= 4 ? <BigTrendPill value='Good' trend='positive' /> :
      <BigTrendPill value='Bad' trend='negative' />
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
    </Loader>
  )
}