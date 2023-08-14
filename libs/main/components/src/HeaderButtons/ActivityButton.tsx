import { useState, useEffect } from 'react'

import { Select }                 from 'antd'
import { SorterResult }           from 'antd/lib/table/interface'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { LayoutUI, Loader, Badge, StatusIcon }                                              from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                        from '@acx-ui/formatter'
import { ClockSolid }                                                                       from '@acx-ui/icons'
import { TimelineDrawer }                                                                   from '@acx-ui/rc/components'
import { useActivitiesQuery }                                                               from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, useTableQuery, getActivityDescription, severityMapping } from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                                       from '@acx-ui/react-router-dom'
import { DateRange, DateRangeFilter, getDateRangeFilter }                                   from '@acx-ui/utils'

import * as UI from './styledComponents'

type Payload = typeof defaultPayload

const defaultPayload: {
  url: string
  filters: { status?: string, dateFilter: DateRangeFilter }
  fields: string[]
} = {
  url: CommonUrlsInfo.getActivityList.url,
  fields: [
    'startDatetime',
    'endDatetime',
    'status',
    'product',
    'admin',
    'descriptionTemplate',
    'descriptionData',
    'severity'
  ],
  filters: {
    dateFilter: getDateRangeFilter(DateRange.last7Days)
  }
}

export default function ActivityButton () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/timeline')
  const [status, setStatus] = useState('all')
  const [detail, setDetail] = useState<Activity>()
  const [detailModal, setDetailModalOpen] = useState<boolean>()
  const [activityModal, setActivityModalOpen] = useState<boolean>()

  const tableQuery = useTableQuery<Activity>({
    useQuery: useActivitiesQuery,
    defaultPayload,
    sorter: {
      sortField: 'startDatetime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 25
    },
    option: { skip: !activityModal }
  })

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ..._.omit(tableQuery.payload.filters as Payload['filters'], ['status']),
        ...(status === 'all' ? {} : { status: [status] })
      }
    })
  }, [status])

  const activityList = <>
    <UI.FilterRow>
      <Select value={status}
        size='small'
        onChange={(val)=>{
          setStatus(val)
        }}>
        <Select.Option value={'all'}>
          { $t({ defaultMessage: 'All Statuses' }) }
        </Select.Option>
        <Select.Option value={'PENDING'}>
          { $t({ defaultMessage: 'Pending' }) }
        </Select.Option>
        <Select.Option value={'INPROGRESS'}>
          { $t({ defaultMessage: 'In Progress' }) }
        </Select.Option>
        <Select.Option value={'SUCCESS'}>
          { $t({ defaultMessage: 'Completed' }) }
        </Select.Option>
      </Select>
      <UI.LinkButton type='link'
        size='small'
        onClick={() => navigate(basePath)}>
        {$t({ defaultMessage: 'View all activities' })}
      </UI.LinkButton>
    </UI.FilterRow>
    <Loader states={[tableQuery]}>
      <UI.ListTable
        itemLayout='horizontal'
        pagination={{
          ...tableQuery.pagination,
          showSizeChanger: false,
          onChange: (page, pageSize) => {
            const pagination = {
              current: page,
              pageSize
            }
            const sorter = {
              field: 'startDatetime',
              order: 'descend'
            } as SorterResult<Activity>
            const extra = {
              currentDataSource: [] as Activity[],
              action: 'paginate' as const
            }
            return tableQuery?.handleTableChange?.(pagination, {}, sorter, extra)
          }
        }}
        dataSource={tableQuery.data?.data}
        renderItem={item => {
          const activity = item as Activity
          return (
            <UI.ActivityItem onClick={() => {
              setDetailModalOpen(true)
              setDetail(activity)
            }}>
              <UI.ActivityMeta
                title={getActivityDescription(
                  activity.descriptionTemplate,
                  activity.descriptionData
                )}
                avatar={<StatusIcon status={activity.status as Activity['status']}/>}
                description={
                  <UI.ListTime>{formatter('calendarFormat')(activity.startDatetime)}</UI.ListTime>}
              />
            </UI.ActivityItem>
          )}}
      />
    </Loader>
  </>

  const getDrawerData = (data: Activity) => [
    {
      title: defineMessage({ defaultMessage: 'Start Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.startDatetime)
    },
    {
      title: defineMessage({ defaultMessage: 'End Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.endDatetime)
    },
    {
      title: defineMessage({ defaultMessage: 'Severity' }),
      value: (() => {
        const msg = severityMapping[data.severity as keyof typeof severityMapping]
        return $t(msg)
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: 'Admin activity'
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: data.admin.name
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getActivityDescription(
        data.descriptionTemplate,
        data.descriptionData
      )
    }
  ]
  return <>
    <Badge
      overflowCount={9}
      offset={[-3, 0]}
      children={<LayoutUI.ButtonSolid
        icon={<ClockSolid />}
        onClick={()=> setActivityModalOpen(!activityModal)}
      />}
    />
    <UI.Drawer
      width={464}
      title={$t({ defaultMessage: 'Activities' })}
      visible={activityModal}
      onClose={() => {
        setActivityModalOpen(false)
      }}
      children={activityList}
    />
    {detailModal && <TimelineDrawer
      width={464}
      title={defineMessage({ defaultMessage: 'Activity Details' })}
      visible={detailModal}
      onClose={() => setDetailModalOpen(false)}
      onBackClick={() => setActivityModalOpen(true)}
      data={getDrawerData?.(detail!)}
      activity={detail}
    />}
  </>
}
