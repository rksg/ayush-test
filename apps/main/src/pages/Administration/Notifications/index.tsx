import { ReactNode, useEffect, useState } from 'react'

import { Row, Col, Badge, Typography } from 'antd'
import { IntlShape, useIntl }          from 'react-intl'

import {
  Button,
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useGetMspProfileQuery }               from '@acx-ui/msp/services'
import { MSPUtils }                            from '@acx-ui/msp/utils'
import {
  useGetNotificationRecipientsQuery,
  useDeleteNotificationRecipientsMutation,
  useDeleteNotificationRecipientMutation,
  useGetNotificationRecipientsPaginatedQuery
} from '@acx-ui/rc/services'
import {
  NotificationRecipientUIModel,
  NotificationEndpointType,
  sortProp,
  defaultSort,
  NotificationRecipientType,
  AdministrationUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'
import {
  filterByAccess,
  hasCrossVenuesPermission
} from '@acx-ui/user'
import { noDataDisplay, getOpsApi, useTableQuery } from '@acx-ui/utils'

import AddRecipientDrawer       from './AddRecipientDrawer'
import { AINotificationDrawer } from './AINotificationDrawer'
import { PreferenceDrawer }     from './PreferenceDrawer'
import RecipientDialog          from './RecipientDialog'
import * as UI                  from './styledComponents'

const FunctionEnabledStatusLightConfig = {
  active: {
    color: 'var(--acx-semantics-green-50)'
  },
  inActive: {
    color: 'var(--acx-neutrals-50)'
  }
}

const recipientTypeFilterOpts = ($t: IntlShape['$t']) => [
  { key: '', value: $t({ defaultMessage: 'All Recipient Type' }) },
  {
    key: NotificationRecipientType.PRIVILEGEGROUP,
    value: $t({ defaultMessage: 'Privileges Groups' })
  },
  {
    key: NotificationRecipientType.GLOBAL,
    value: $t({ defaultMessage: 'Global Recipients' })
  }
]

export const NotificationsTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const notificationChannelEnabled = useIsSplitOn(Features.NOTIFICATION_CHANNEL_SELECTION_TOGGLE)
  const notificationAdminContextualEnabled =
    useIsSplitOn(Features.NOTIFICATION_ADMIN_CONTEXTUAL_TOGGLE)
  const notificationsPaginatedListToggle =
  useIsSplitOn(Features.MSPSERVICE_NOTIFICATION_ACCOUNTS_SEARCH_TOGGLE)
  // eslint-disable-next-line max-len
  const [editData, setEditData] = useState<NotificationRecipientUIModel>({} as NotificationRecipientUIModel)

  useEffect(() => {
    const showDrawerByForwarding =
      !!sessionStorage.getItem('intent-subscription-forward-r1-show-drawer')
    if (showDrawerByForwarding) {
      setShowDrawer(true)
      sessionStorage.removeItem('intent-subscription-forward-r1-show-drawer')
    }
  }, [])

  const defaultPayload = {
    page: 0,
    pageStartZero: true,
    pageSize: 20,
    sortField: 'name',
    sortOrder: 'ASC',
    searchTargetFields: [
      'name'
    ],
    searchString: '',
    filters: {}
  }

  const settingsId = 'paginated-notifications-table'

  const withoutPaginatdNotificationList = useGetNotificationRecipientsQuery({ params },
    { skip: notificationsPaginatedListToggle })
  const { data: paginatedNotificationList, isLoading: paginatedNotificationListIsLoading,
    isFetching: paginatedNotificationListIsFetching,
    handleTableChange, handleFilterChange, pagination } = useTableQuery({
    useQuery: useGetNotificationRecipientsPaginatedQuery,
    defaultPayload,
    option: { skip: !notificationsPaginatedListToggle },
    pagination: { settingsId }
  })

  const { notificationList,
    notificationListIsLoading,
    notificationListIsFetching } = notificationsPaginatedListToggle
    ? { notificationList: paginatedNotificationList,
      notificationListIsLoading: paginatedNotificationListIsLoading,
      notificationListIsFetching: paginatedNotificationListIsFetching
    }
    : { notificationList: withoutPaginatdNotificationList,
      notificationListIsLoading: withoutPaginatdNotificationList.isLoading,
      notificationListIsFetching: withoutPaginatdNotificationList.isFetching }


  const [deleteRecipient, deleteOneState] = useDeleteNotificationRecipientMutation()
  const [deleteRecipients, deleteMultipleState] = useDeleteNotificationRecipientsMutation()


  const handleClickAddRecipient = () => {
    setEditMode(false)
    setEditData({} as NotificationRecipientUIModel)
    setShowDialog(true)
  }

  const handleEnableIncidents = () => {
    setShowDrawer(true)
  }

  const isDuplicated = (type: string, value: string): boolean => {
    if (notificationList?.data === undefined) return false
    let hasDuplicated = false

    let data
    for (let i = 0; i < notificationList.data.length; i++) {
      data = notificationList.data[i]

      if (type === NotificationEndpointType.email) {
        hasDuplicated = data.email === value
      }

      if (type === NotificationEndpointType.sms) {
        hasDuplicated = data.mobile === value
      }

      if (hasDuplicated) break
    }

    return hasDuplicated
  }

  const renderDataWithStatus = (data:string, enabled: boolean,
    highlightFn?: (value: string, formatFn?: (keyword: string)
    => React.ReactNode) => ReactNode) => {
    return data ? <Badge
      color={FunctionEnabledStatusLightConfig[enabled ? 'active' : 'inActive'].color}
      text={highlightFn ? highlightFn(data) : data}
    /> : noDataDisplay
  }

  const renderDeliveryPreference = (row: NotificationRecipientUIModel) => {
    const deliveryPreference = []
    if (row.emailEnabled || row.emailPreferences)
      deliveryPreference.push($t({ defaultMessage: 'Email' }))
    if (row.mobileEnabled || row.smsPreferences)
      deliveryPreference.push($t({ defaultMessage: 'SMS' }))
    return deliveryPreference.length > 0
      ? deliveryPreference.join(', ')
      : noDataDisplay
  }

  const columns: TableProps<NotificationRecipientUIModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Recipient Name' }),
      key: 'description',
      dataIndex: 'description',
      defaultSortOrder: 'ascend',
      searchable: true,
      sorter: { compare: sortProp('description', defaultSort) },
      render: function (_, row, __, highlightFn) {
        return row?.description
          ? highlightFn(row?.description)
          : row?.description
      }
    },
    ...(!notificationAdminContextualEnabled ? [] : [
      {
        title: $t({ defaultMessage: 'Recipient Type' }),
        dataIndex: 'recipientType',
        key: 'recipientType',
        filterMultiple: false,
        filterable: recipientTypeFilterOpts($t),
        render: (data: ReactNode, row: NotificationRecipientUIModel ) => {
          return row.recipientType === NotificationRecipientType.PRIVILEGEGROUP
            ? $t({ defaultMessage: 'Privilege Group' })
            : $t({ defaultMessage: 'Global' })
        }
      },
      {
        title: $t({ defaultMessage: 'Delivery Preference' }),
        dataIndex: 'deliveryPreference',
        key: 'deliveryPreference',
        render: (data: ReactNode, row: NotificationRecipientUIModel ) => {
          return renderDeliveryPreference(row)
        }
      }
    ]),
    {
      title: $t({ defaultMessage: 'Email Address' }),
      key: 'email',
      dataIndex: 'email',
      searchable: !!notificationsPaginatedListToggle,
      sorter: { compare: sortProp('email', defaultSort) },
      render: (_, row, __, highlightFn) => {
        const _highlightFn = notificationsPaginatedListToggle
          ? highlightFn : undefined
        return row.recipientType === NotificationRecipientType.GLOBAL
          ? renderDataWithStatus(row.email, row.emailEnabled, _highlightFn)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Mobile Phone' }),
      key: 'mobile',
      dataIndex: 'mobile',
      searchable: !!notificationsPaginatedListToggle,
      sorter: { compare: sortProp('mobile', defaultSort) },
      render: (_, row, __, highlightFn) => {
        const _highlightFn = notificationsPaginatedListToggle
          ? highlightFn : undefined
        return row.recipientType === NotificationRecipientType.GLOBAL
          ? renderDataWithStatus(row.mobile, row.mobileEnabled, _highlightFn)
          : noDataDisplay
      }
    }
  ]

  const rowActions: TableProps<NotificationRecipientUIModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateRecipient)],
      onClick: (selectedRows) => {
        // show edit dialog
        setEditMode(true)
        setEditData(selectedRows[0])
        setShowDialog(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deleteNotificationRecipients)],
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Recipients' }),
            entityValue: rows.length === 1 ? rows[0].description : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteRecipient({
                params: {
                  tenantId: params.tenantId,
                  recipientId: rows[0].id
                } })
                .then(clearSelection) :
              deleteRecipients({
                params,
                payload: rows.map(item => item.id)
              }).then(clearSelection)
          }
        })
      }
    }
  ]

  const titleNotification = notificationChannelEnabled
    ? $t({ defaultMessage: 'Notifications Preferences' })
    : $t({ defaultMessage: 'AI Notifications' })

  const tableActions = [
    {
      label: $t({ defaultMessage: 'Add Recipient' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.addRecipient)],
      onClick: handleClickAddRecipient
    },
    {
      label: titleNotification,
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateTenantSelf)],
      onClick: handleEnableIncidents
    }
  ]

  const isLoading = deleteOneState.isLoading || deleteMultipleState.isLoading

  return (
    <>
      <Loader states={[
        { isLoading: notificationListIsLoading,
          isFetching: notificationListIsFetching || isLoading }
      ]}>
        <Table
          columns={columns}
          dataSource={notificationList?.data}
          pagination={pagination}
          onChange={handleTableChange}
          onFilterChange={handleFilterChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasCrossVenuesPermission()
            && filterByAccess(rowActions).length > 0
            && { type: 'checkbox' }}
          actions={hasCrossVenuesPermission() ? filterByAccess(tableActions) : []}
        />
      </Loader>

      {notificationAdminContextualEnabled
        ? <AddRecipientDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          editMode={editMode}
          editData={editData}
          isDuplicated={isDuplicated}
          RecipientData={notificationList?.data ?? []}
        />
        : <RecipientDialog
          visible={showDialog}
          setVisible={setShowDialog}
          editMode={editMode}
          editData={editData}
          isDuplicated={isDuplicated}
        />}
      {showDrawer
      && <AINotificationDrawer
        showDrawer={showDrawer}
        setShowDrawer={setShowDrawer}
      />}
    </>
  )
}

const Notifications = () => {
  const { $t } = useIntl()
  const mspUtils = MSPUtils()
  const isMspRbacMspEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const { data: mspProfile } = useGetMspProfileQuery({ enableRbac: isMspRbacMspEnabled })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)
  const isMspAggregateNotification =
    useIsSplitOn(Features.MSP_AGGREGATE_NOTIFICATION_TOGGLE) && isOnboardedMsp
  const [showPreference, setShowPreference] = useState(false)

  return <UI.Wrapper>
    <Row>
      <Col span={24} className='description'>
        <Typography>
          {
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'System notifications will be sent to the following email addresses and mobile devices:' })
          }
          {isMspAggregateNotification && <Button style={{ marginLeft: 13 }}
            type='link'
            size='small'
            onClick={() => { setShowPreference(true) }}>
            {$t({ defaultMessage: 'Preferences' })}
          </Button>}
        </Typography>

      </Col>
    </Row>
    <UI.Spacer />
    {showPreference && <PreferenceDrawer
      visible={showPreference}
      setVisible={setShowPreference}
    />}

    <NotificationsTable />
  </UI.Wrapper>
}

export default Notifications
