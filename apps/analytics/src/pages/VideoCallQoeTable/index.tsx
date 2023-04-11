
import { SortOrder }          from 'antd/lib/table/interface'
import { startCase, toLower } from 'lodash'
import { useIntl }            from 'react-intl'

import { defaultSort, dateSort, sortProp }                        from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip, TrendPill, showActionModal } from '@acx-ui/components'
import { Loader }                                                 from '@acx-ui/components'
import { DateFormatEnum, formatter }                              from '@acx-ui/formatter'
import { TenantLink }                                             from '@acx-ui/react-router-dom'
import { TimeStamp }                                              from '@acx-ui/types'
import { TABLE_DEFAULT_PAGE_SIZE }                                from '@acx-ui/utils'

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

  const columnHeaders: TableProps<Meeting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      render: (value: unknown, row: unknown) => {
        const formattedStatus = startCase(toLower(value as string))
        const meetingId = (row as Meeting).id
        // TODO implement url text based on Ended or Not Started Call
        const urlTxt = formattedStatus === 'Ended' ? `${meetingId}` : `${meetingId}`
        return (
          <TenantLink to={`/serviceValidation/videoCallQoe/${urlTxt}`}>
            {value as string}
          </TenantLink>
        )
      },
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Created Time' }),
      dataIndex: 'createdTime',
      key: 'createdTime',
      defaultSortOrder: 'descend' as SortOrder,
      render: (value: unknown) =>
        formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value as string),
      sorter: { compare: sortProp('createdTime', dateSort) },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Start Time' }),
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: unknown) => {
        return value ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value as string) : '-'
      },
      sorter: { compare: sortProp('startTime', dateSort) },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Participants' }),
      dataIndex: 'participantCount',
      key: 'participantCount',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('participantCount', defaultSort) },
      align: 'center'
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
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'QoE' }),
      dataIndex: 'mos',
      key: 'mos',
      render: (value: unknown) => {
        const mos = value as number
        const isValidMos = mos ? true : false
        return isValidMos ? (mos >= 4 ? <TrendPill value='Good' trend='positive' /> :
          <TrendPill value='Bad' trend='negative' />) : '-'
      },
      sorter: { compare: sortProp('mos', defaultSort) },
      align: 'center'
    }
  ]

  const actions: TableProps<(typeof meetingList)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Test Call(s)' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length,
            confirmationText: shouldShowConfirmation(rows) ? 'Delete' : undefined
          },
          onOk: () => { }
        })
      }
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <Table
        columns={columnHeaders}
        dataSource={meetingList}
        rowActions={actions}
        rowKey='id'
        rowSelection={{ type: 'checkbox' }}
        pagination={{
          pageSize: TABLE_DEFAULT_PAGE_SIZE,
          defaultPageSize: TABLE_DEFAULT_PAGE_SIZE
        }}
      />
    </Loader>
  )
}

function shouldShowConfirmation (rows: unknown[]) {
  return rows.length > 0
}
