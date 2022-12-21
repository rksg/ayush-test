import { useState, useEffect } from 'react'

import { ClockCircleFilled } from '@ant-design/icons'
import { Select }            from 'antd'
import { useIntl }           from 'react-intl'

import {
  LayoutUI,
  Loader,
  Badge
} from '@acx-ui/components'
import { CancelCircleSolid, CheckMarkCircleSolid, Pending, InProgress } from '@acx-ui/icons'
import { useActivitiesQuery }                                           from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, useTableQuery, getDescription }      from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                   from '@acx-ui/react-router-dom'
import { formatter }                                                    from '@acx-ui/utils'

import * as UI from './styledComponents'

const getIcon = (
  status: Activity['status']
) => {
  switch(status) {
    case 'SUCCESS':
      return <CheckMarkCircleSolid />
    case 'PENDING':
      return <Pending />
    case 'INPROGRESS':
      return <InProgress />
    case 'FAILED':
      return <CancelCircleSolid />
    case 'OFFLINE':
      return <div />
  }
  return
}

const defaultPayload: {
  url: string
  filters?: {
    status?: string[]
  }
  fields: string[]
} = {
  url: CommonUrlsInfo.getActivityList.url,
  filters: { status: ['all'] },
  fields: [
    'startDatetime',
    'endDatetime',
    'status',
    'product',
    'admin',
    'descriptionTemplate',
    'descriptionData',
    'severity'
  ]
}

export default function ActivityHeaderButton () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/timeline')
  const [modalState, setModalOpen] = useState<boolean>()
  const [status, setStatus] = useState('all')

  const tableQuery = useTableQuery({
    useQuery: useActivitiesQuery,
    defaultPayload,
    sorter: {
      sortField: 'startDatetime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 25
    }
  })

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: status==='all' ? {} : { status: [status] }
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
        disabled={tableQuery.data?.totalCount === 0}
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
            const extra = {
              currentDataSource: [] as Activity[],
              action: 'paginate' as const
            }
            return tableQuery?.handleTableChange?.(pagination, {}, {}, extra)
          }
        }}
        dataSource={tableQuery.data?.data}
        renderItem={(item) => {
          const activity = item as Activity
          return (
            <UI.ListItem>
              <UI.ActivityMeta
                title={getDescription(activity.descriptionTemplate, activity.descriptionData)}
                avatar={getIcon(activity.status)}
                description={
                  <UI.ListTime>{formatter('calendarFormat')(activity.startDatetime)}</UI.ListTime>}
              />
            </UI.ListItem>
          )}}
      />
    </Loader>
  </>

  return <>
    <Badge
      overflowCount={9}
      offset={[-3, 0]}
      children={<LayoutUI.ButtonSolid icon={<ClockCircleFilled />}
        onClick={()=>{
          setModalOpen(true)
        }}/>}
    />
    <UI.Drawer
      width={464}
      title={$t({ defaultMessage: 'Activities' })}
      visible={modalState}
      onClose={() => {
        setModalOpen(false)
      }}
      mask={true}
      children={activityList}
    />
  </>
}
