import { useState, useEffect, useRef } from 'react'

import { Select }                 from 'antd'
import { SorterResult }           from 'antd/lib/table/interface'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { LayoutUI, Loader, StatusIcon }                                                                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                 from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                                                              from '@acx-ui/formatter'
import { ClockSolid }                                                                                                             from '@acx-ui/icons'
import { TimelineDrawer }                                                                                                         from '@acx-ui/rc/components'
import { useActivitiesQuery }                                                                                                     from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, getActivityDescription, severityMapping, initActivitySocket, closeActivitySocket, TxStatus }   from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate, useParams }                                                                                  from '@acx-ui/react-router-dom'
import { getProductKey, getUserSettingsByPath, setDeepUserSettings, useLazyGetAllUserSettingsQuery, useSaveUserSettingsMutation } from '@acx-ui/user'
import { useTableQuery, DateRange, DateRangeFilter, getDateRangeFilter }                                                          from '@acx-ui/utils'

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

interface activityData {
  showUnreadMark: boolean
}
export default function ActivityButton () {
  const ACTIVITY_USER_SETTING = 'COMMON$activity'
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/timeline')
  const params = useParams()
  const [getUserSettings] = useLazyGetAllUserSettingsQuery()
  const [saveUserSettings] = useSaveUserSettingsMutation()
  const [status, setStatus] = useState('all')
  const [showUnreadMark, setShowUnreadMark] = useState<boolean>(false)
  const [detail, setDetail] = useState<Activity>()
  const [detailModal, setDetailModalOpen] = useState<boolean>(false)
  const [activityModal, setActivityModalOpen] = useState<boolean>(false)
  const activitySocketRef = useRef<SocketIOClient.Socket>()
  const isPtenantRbacApiEnabled = useIsSplitOn(Features.PTENANT_RBAC_API)

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

  useEffect(() => {
    if (!activitySocketRef.current) {
      activitySocketRef.current = initActivitySocket((msg:string) => {
        if(JSON.parse(msg).status === TxStatus.IN_PROGRESS) {
          updateShowUnreadMaskStatus(true)
        }
      })
    }

    return closeSocket
  }, [])

  const closeSocket = () => {
    if (activitySocketRef.current) closeActivitySocket(activitySocketRef.current)
  }

  useEffect(() => {
    const fetchUserSettings = async () => {
      const userSettings = await getUserSettings({ params,
        enableRbac: isPtenantRbacApiEnabled }).unwrap()
      // eslint-disable-next-line max-len
      const activity = getUserSettingsByPath(userSettings, ACTIVITY_USER_SETTING) as unknown as activityData
      if(activity){
        setShowUnreadMark(activity.showUnreadMark)
      }
    }
    fetchUserSettings()
  }, [])

  const updateShowUnreadMaskStatus = async (show: boolean) => {
    if(showUnreadMark === show) {return}
    setShowUnreadMark(show)
    const userSettings = await getUserSettings({ params }).unwrap()
    const productKey = getProductKey(ACTIVITY_USER_SETTING)
    // eslint-disable-next-line max-len
    const activity = getUserSettingsByPath(userSettings, ACTIVITY_USER_SETTING) as unknown as activityData
    const newSettings = setDeepUserSettings(userSettings, ACTIVITY_USER_SETTING, {
      ...activity, showUnreadMark: show })
    saveUserSettings({
      params: {
        tenantId: params.tenantId,
        productKey
      },
      payload: newSettings[productKey],
      enableRbac: isPtenantRbacApiEnabled
    }).unwrap()
  }

  const onChangeActivityModal = (show:boolean) => {
    setActivityModalOpen(show)
    updateShowUnreadMaskStatus(false)
  }

  const activityList = <>
    <UI.FilterRow>
      <Select value={status}
        size='small'
        onChange={(val)=>{
          setStatus(val)
        }}
        dropdownMatchSelectWidth={false}>
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
        onClick={() => {
          setActivityModalOpen(false)
          navigate(basePath)
        }}>
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
                  activity.descriptionData,
                  activity?.linkData
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
        data.descriptionData,
        data?.linkData
      )
    }
  ]
  return <>
    <UI.ActivityBadge
      overflowCount={999}
      offset={[-3, 0]}
      dot={showUnreadMark}
      children={<LayoutUI.ButtonSolid
        icon={<ClockSolid />}
        onClick={() => {onChangeActivityModal(!activityModal)}}
      />}
    />
    <UI.Drawer
      width={464}
      title={$t({ defaultMessage: 'Activities' })}
      visible={activityModal}
      onClose={() => onChangeActivityModal(false)}
      children={activityList}
    />
    {detail && <TimelineDrawer
      width={464}
      title={defineMessage({ defaultMessage: 'Activity Details' })}
      visible={detailModal}
      onClose={() => setDetailModalOpen(false)}
      onBackClick={() => onChangeActivityModal(true)}
      data={getDrawerData?.(detail!)}
      activity={detail}
    />}
  </>
}
