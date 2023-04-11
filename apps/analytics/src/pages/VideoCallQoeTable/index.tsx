
import { startCase, toLower } from 'lodash'
import { useIntl }            from 'react-intl'

import { defaultSort, dateSort, sortProp }       from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip, TrendPill } from '@acx-ui/components'
import { Loader, showToast }                     from '@acx-ui/components'
import { DateFormatEnum, formatter }             from '@acx-ui/formatter'
import { TenantLink }                            from '@acx-ui/react-router-dom'
import { TimeStamp }                             from '@acx-ui/types'

import { useVideoCallQoeTestsQuery } from '../VideoCallQoe/services'

import { messageMapping } from './errorMessageMapping'
import * as UI            from './styledComponents'


export function VideoCallQoeTable () {
  const { $t } = useIntl()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const queryResults = useVideoCallQoeTestsQuery(null)
  const allCallQoeTests = queryResults.data?.getAllCallQoeTests

  type Meeting = {
    id: number,
    name: string
    zoomMeetingId: number,
    status: string,
    invalidReason: string,
    joinUrl: string,
    participantCount: number,
    mos: number,
    createdTime: TimeStamp,
    startTime: TimeStamp,
    endTime: TimeStamp
  }

  const meetingList: Meeting[] = []
  allCallQoeTests?.forEach((qoeTest)=> {
    const { name, meetings } = qoeTest
    meetings.forEach(meeting => {
      meetingList.push( { name, ...meeting } )
    })
  })

  const columnHeaders = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      render: (value: unknown,{ id }:{ id:number }) => {
        return(
          <TenantLink to={`/serviceValidation/videoCallQoe/${id}`}>
            {value as string}
          </TenantLink>
        )
      },
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Created Time' }),
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (value: unknown) =>
        formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value as string),
      sorter: { compare: sortProp('createdTime', dateSort) },
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Start Time' }),
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: unknown) => {
        return value ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value as string) : '-'
      },
      sorter: { compare: sortProp('startTime', dateSort) },
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Participants' }),
      dataIndex: 'participantCount',
      key: 'participantCount',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('participantCount', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      render: (value: unknown, row: unknown) => {
        const formattedStatus = startCase(toLower(value as string))
        return (formattedStatus !== 'Invalid' ? formattedStatus :
          (<Tooltip placement='top'
            title={$t(messageMapping[
            (row as Meeting).invalidReason as keyof typeof messageMapping
            ])}>
            <UI.WithDottedUnderline>{formattedStatus}</UI.WithDottedUnderline>
          </Tooltip>))
      },
      sorter: { compare: sortProp('status', defaultSort) },
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'QoE' }),
      dataIndex: 'mos',
      key: 'mos',
      render: (value: unknown) => {
        const mos = value as number
        const isValidMos = mos ? true : false
        return isValidMos ? (mos > 4 ? <TrendPill value='Good' trend='positive' /> :
          <TrendPill value='Bad' trend='negative' />) : '-'
      },
      sorter: { compare: sortProp('mos', defaultSort) }
    }
  ]

  const actions: TableProps<(typeof meetingList)[0]>['rowActions'] = [
    {
      label: 'Delete',
      onClick: (selectedRows) => showToast({
        type: 'info',
        content: `Delete ${selectedRows.length} item(s)`
      })
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <Table
        columns={columnHeaders}
        dataSource={meetingList}
        rowActions={actions}
        rowSelection={{ defaultSelectedRowKeys: [] }}
      />
    </Loader>
  )
}
