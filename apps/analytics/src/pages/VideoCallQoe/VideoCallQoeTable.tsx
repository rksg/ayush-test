
import { useContext, useState } from 'react'

import { SortOrder }          from 'antd/lib/table/interface'
import { startCase, toLower } from 'lodash'
import { useIntl }            from 'react-intl'
import { defineMessage }      from 'react-intl'

import { defaultSort, dateSort, sortProp }                                                          from '@acx-ui/analytics/utils'
import { Button, Table, TableProps, Tooltip, TrendPill, TrendTypeEnum, showActionModal, showToast } from '@acx-ui/components'
import { Loader }                                                                                   from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                from '@acx-ui/formatter'
import { TenantLink }                                                                               from '@acx-ui/react-router-dom'
import { TABLE_DEFAULT_PAGE_SIZE }                                                                  from '@acx-ui/utils'

import { useVideoCallQoeTestsQuery, useDeleteCallQoeTestMutation } from '../VideoCallQoe/services'

import * as MeetingType         from './constants'
import { messageMapping }       from './contents'
import * as UI                  from './styledComponents'
import { TestDetailsDrawer }    from './TestDetailsDrawer'
import { Meeting, TestDetails } from './types'

import { CountContext } from '.'

export function VideoCallQoeTable () {
  const { $t } = useIntl()
  const { setCount } = useContext(CountContext)
  const [visible, setVisible] = useState(false)
  const [testDetails, setTestDetails] = useState<TestDetails>({ name: '', link: '' })
  const queryResults = useVideoCallQoeTestsQuery({})
  const allCallQoeTests = queryResults.data?.getAllCallQoeTests
  const meetingList: Meeting[] = []
  allCallQoeTests?.forEach((qoeTest)=> {
    const { name, meetings } = qoeTest
    meetings.forEach(meeting => {
      meetingList.push( { ...meeting, name } )
    })
  })
  const [ deleteCallQoeTest ] = useDeleteCallQoeTestMutation()

  const statusMapping = {
    NOT_STARTED: defineMessage({ defaultMessage: 'Not Started' }),
    STARTED: defineMessage({ defaultMessage: 'Started' }),
    ENDED: defineMessage({ defaultMessage: 'Ended' }),
    INVALID: defineMessage({ defaultMessage: 'Invalid' })
  }

  const columnHeaders: TableProps<Meeting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Test Call Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      render: (value: unknown, row: unknown) => {
        const status = startCase(toLower((row as Meeting).status as string))
        const meetingId = (row as Meeting).id
        return [MeetingType.ENDED].includes(status)
          ? <TenantLink to={`/analytics/videoCallQoe/${meetingId}`}>
            {value as string}
          </TenantLink>
          : [MeetingType.NOT_STARTED, MeetingType.STARTED].includes(status)
            ? <Button
              type='link'
              onClick={()=>{
                setVisible(true)
                setTestDetails({ name: value as string, link: (row as Meeting).joinUrl })
              }
              }>
              {value as string}
            </Button>
            : value as string
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
      align: 'center',
      width: 160
    },
    {
      title: $t({ defaultMessage: 'Start Time' }),
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: unknown) => {
        return value ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value as string) : '-'
      },
      sorter: { compare: sortProp('startTime', dateSort) },
      align: 'center',
      width: 160
    },
    {
      title: $t({ defaultMessage: 'Participants' }),
      dataIndex: 'participantCount',
      key: 'participantCount',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('participantCount', defaultSort) },
      align: 'center',
      width: 85
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      render: (value: unknown, row: unknown) => {
        const meetingStatus = $t(statusMapping[value as keyof typeof statusMapping])
        const formattedStatus = startCase(toLower(value as string))
        return (formattedStatus !== MeetingType.INVALID ? meetingStatus :
          (<Tooltip placement='top'
            title={$t(messageMapping[
            (row as Meeting).invalidReason as keyof typeof messageMapping
            ])}>
            <UI.WithDottedUnderline>
              {meetingStatus}
            </UI.WithDottedUnderline>
          </Tooltip>))
      },
      sorter: { compare: sortProp('status', defaultSort) },
      align: 'center',
      width: 85,
      filterable: Object.entries(statusMapping)
        .map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      title: $t({ defaultMessage: 'QoE' }),
      dataIndex: 'mos',
      key: 'mos',
      render: (value: unknown) => {
        const mos = value as number
        const isValidMos = mos ? true : false
        return isValidMos ? (mos >= 4 ? <TrendPill
          value={$t({ defaultMessage: 'Good' })}
          trend={TrendTypeEnum.Positive}
        /> :
          <TrendPill
            value={$t({ defaultMessage: 'Bad' })}
            trend={TrendTypeEnum.Negative} />) : '-'
      },
      sorter: { compare: sortProp('mos', defaultSort) },
      align: 'center',
      width: 50
    }
  ]

  const actions: TableProps<(typeof meetingList)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Test Call' }),
            entityValue: name
          },
          onOk: async () => {
            const deleteResponse = await deleteCallQoeTest({ id }).unwrap()
            if (deleteResponse) {
              showToast({ type: 'success', content: $t(messageMapping.TEST_DELETE_SUCCESS) })
            } else {
              showToast({ type: 'error', content: $t(messageMapping.TEST_DELETE_ERROR) })
            }
            clearSelection()
          }
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
        rowSelection={{ type: 'radio' }}
        pagination={{
          pageSize: TABLE_DEFAULT_PAGE_SIZE,
          defaultPageSize: TABLE_DEFAULT_PAGE_SIZE
        }}
        onDisplayRowChange={(dataSource) => setCount?.(dataSource.length)}
      />
      <TestDetailsDrawer visible={visible} setVisible={setVisible} testDetails={testDetails}/>
    </Loader>
  )
}
