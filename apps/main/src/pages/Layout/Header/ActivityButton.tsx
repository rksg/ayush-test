import { useEffect, useState } from 'react'

import { ClockCircleFilled } from '@ant-design/icons'
import { Select }            from 'antd'
import { useIntl }           from 'react-intl'

import {
  LayoutUI,
  Loader,
  Tooltip,
  Badge,
  Button
} from '@acx-ui/components'
import { CancelCircleSolid, CheckMarkCircleSolid, Pending, InProgress } from '@acx-ui/icons'
import { useActivitiesQuery }                                           from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, useTableQuery }                      from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                   from '@acx-ui/react-router-dom'
import { formatter }                                                    from '@acx-ui/utils'

import * as UI from './styledComponents'

const defaultArray: Activity[] = []

const getDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  const values = descriptionData?.reduce((agg, data) =>
    ({ ...agg, [data.name]: data.value })
  , {} as Record<string, string>)
  let message = descriptionTemplate
  message && message.match(new RegExp(/@@\w+/, 'g'))?.forEach(match => {
    message = message.replace(match, values[match.replace('@@','')])
  })
  return message
}

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
  }
  return
}

const defaultPayload: {
  url: string
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

  const [tableData, setTableData] = useState(defaultArray)

  useEffect(()=>{
    if (tableQuery.data?.data) {
      setTableData(tableQuery.data.data)
    }

    tableQuery.setPayload(tableQuery.payload)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableQuery.data, status])

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
        <Select.Option value={'Pending'}>
          { $t({ defaultMessage: 'Pending' }) }
        </Select.Option>
        <Select.Option value={'InProgress'}>
          { $t({ defaultMessage: 'In Progress' }) }
        </Select.Option>
        <Select.Option value={'Failed'}>
          { $t({ defaultMessage: 'Failed' }) }
        </Select.Option>
        <Select.Option value={'Completed'}>
          { $t({ defaultMessage: 'Completed' }) }
        </Select.Option>
      </Select>
      <Button type='link'
        disabled={tableQuery.data?.totalCount === 0}
        size='small'
        style={{ fontWeight: 'var(--acx-body-font-weight-bold)' }}
        onClick={() => navigate(basePath)}>
        {$t({ defaultMessage: 'View all activities' })}
      </Button>
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
              pageSize,
              sortField: 'startDatetime',
              sortOrder: 'DESC'
            }
            const extra = {
              currentDataSource: [] as Activity[],
              action: 'paginate' as const
            }
            return tableQuery?.handleTableChange?.(pagination, {}, {}, extra)
          }
        }}
        dataSource={tableData}
        renderItem={(item) => {
          const activity = item as Activity
          return (
            <UI.ListItem>
              <UI.Meta
                title={getDescription(activity.descriptionTemplate, activity.descriptionData)}
                avatar={getIcon(activity.status)}
                description={<UI.ListTime>{formatter('calendarFormat')(activity.startDatetime)}</UI.ListTime>}
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
