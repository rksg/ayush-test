
import { useContext, useState } from 'react'

import { SortOrder }          from 'antd/lib/table/interface'
import { startCase, toLower } from 'lodash'
import { useIntl }            from 'react-intl'
import { defineMessage }      from 'react-intl'

import { defaultSort, dateSort, sortProp, TrendTypeEnum } from '@acx-ui/analytics/utils'
import {
  Button,
  Table,
  TableProps,
  Tooltip,
  TrendPill,
  showActionModal,
  showToast
} from '@acx-ui/components'
import { Loader }                    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { TenantLink }                from '@acx-ui/react-router-dom'
import { WifiScopes }                from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  aiOpsApis,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'

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

  allCallQoeTests?.forEach((qoeTest) => {
    const { name, meetings, id: testId } = qoeTest

    meetings.forEach(meeting => {
      // As part of mugration, some calls were marked as invalid
      // Which was still getting showed with mos. We are resetting here
      // to fix sorting issues on QoE column
      const meetingCopy = {
        ...meeting
      }
      if (meeting.status === MeetingType.INVALID.toUpperCase() && meeting.mos > 0) {
        meetingCopy.mos = -1
      }
      meetingList.push({ ...meetingCopy, name, testId })
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
      render: (_, row) => {
        const status = startCase(toLower(row.status as string))
        const testId = row.testId

        if ([MeetingType.ENDED].includes(status)) {
          return (
            <TenantLink to={`/analytics/videoCallQoe/${testId}`}>
              {row.name}
            </TenantLink>
          )
        } else if ([MeetingType.NOT_STARTED, MeetingType.STARTED].includes(status)) {
          const handleClick = () => {
            setVisible(true)
            setTestDetails({ name: row.name, link: row.joinUrl })
          }

          return (
            <Button type='link' onClick={handleClick} size='small'>
              {row.name}
            </Button>
          )
        } else {
          return row.name
        }
      },
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Created Time' }),
      dataIndex: 'createdTime',
      key: 'createdTime',
      defaultSortOrder: 'descend' as SortOrder,
      render: (_, { createdTime }) =>
        formatter(DateFormatEnum.DateTimeFormatWithSeconds)(createdTime),
      sorter: { compare: sortProp('createdTime', dateSort) },
      align: 'center',
      width: 160
    },
    {
      title: $t({ defaultMessage: 'Start Time' }),
      dataIndex: 'startTime',
      key: 'startTime',
      render: (_, { startTime }) => {
        return startTime ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(startTime) : '-'
      },
      sorter: { compare: sortProp('startTime', dateSort) },
      align: 'center',
      width: 160
    },
    {
      title: $t({ defaultMessage: 'Participants' }),
      dataIndex: 'participantCount',
      key: 'participantCount',
      render: (_, { participantCount }) => {
        return participantCount ? participantCount : '-'
      },
      sorter: { compare: sortProp('participantCount', defaultSort) },
      align: 'center',
      width: 85
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => {
        const meetingStatus = $t(statusMapping[row.status as keyof typeof statusMapping])
        const formattedStatus = startCase(toLower(row.status))

        if (formattedStatus !== MeetingType.INVALID) {
          return meetingStatus
        }

        const invalidReason = messageMapping[row.invalidReason as keyof typeof messageMapping]
        return (
          <Tooltip placement='top' title={$t(invalidReason)} dottedUnderline={true}>
            <UI.Invalid>
              {meetingStatus}
            </UI.Invalid>
          </Tooltip>
        )
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
      render: (_, { mos, status }) => {
        const formattedStatus = startCase(toLower(status))
        const isValidMos = Boolean(mos)
        if (formattedStatus === MeetingType.ENDED && isValidMos) {
          if (mos >= 4) {
            return (
              <TrendPill
                value={$t({ defaultMessage: 'Good' })}
                trend={TrendTypeEnum.Positive}
              />
            )
          } else {
            return (
              <TrendPill
                value={$t({ defaultMessage: 'Bad' })}
                trend={TrendTypeEnum.Negative}
              />
            )
          }
        } else {
          return '-'
        }
      },
      sorter: { compare: sortProp('mos', defaultSort) },
      align: 'center',
      width: 50
    }
  ]

  const actions: TableProps<(typeof meetingList)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [WifiScopes.DELETE],
      rbacOpsIds: [aiOpsApis.deleteVideoCallQoe],
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

  const { rbacOpsApiEnabled } = getUserProfile()
  const hasRowSelection = rbacOpsApiEnabled
    ? hasAllowedOperations([aiOpsApis.deleteVideoCallQoe])
    : hasCrossVenuesPermission() && hasPermission({
      permission: 'WRITE_VIDEO_CALL_QOE',
      scopes: [WifiScopes.UPDATE]
    })

  return (
    <Loader states={[queryResults]}>
      <Table
        columns={columnHeaders}
        dataSource={meetingList}
        rowActions={filterByAccess(actions)}
        rowKey='id'
        rowSelection={hasRowSelection && { type: 'radio' }}
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
