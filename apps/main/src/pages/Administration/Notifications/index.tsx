import { useState } from 'react'

import { Row, Col, Badge, Typography } from 'antd'
import { IntlShape, useIntl }          from 'react-intl'

import {
  Button,
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import { useGetMspProfileQuery }           from '@acx-ui/msp/services'
import { MSPUtils }                        from '@acx-ui/msp/utils'
import {
  useGetNotificationRecipientsQuery,
  useDeleteNotificationRecipientsMutation,
  useDeleteNotificationRecipientMutation
} from '@acx-ui/rc/services'
import {
  NotificationRecipientUIModel,
  NotificationEndpointType,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'
import {
  filterByAccess,
  hasAccess,
  hasCrossVenuesPermission
} from '@acx-ui/user'

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
    key: 'PRIVILEDGE',
    value: $t({ defaultMessage: 'Priviledges Groups' })
  },
  {
    key: 'GLOBAL',
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
  const notificationAdminContextualEnabled = true//useIsSplitOn(Features.NOTIFICATION_ADMIN_CONTEXTUAL_TOGGLE)
  // eslint-disable-next-line max-len
  const [editData, setEditData] = useState<NotificationRecipientUIModel>({} as NotificationRecipientUIModel)


  const notificationList = useGetNotificationRecipientsQuery({ params })

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
    if (notificationList.data === undefined) return false
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

  const renderDataWithStatus = (data:string, enabled: boolean) => {
    return data ? <Badge
      color={FunctionEnabledStatusLightConfig[enabled ? 'active' : 'inActive'].color}
      text={data}
    /> : data
  }

  const columns: TableProps<NotificationRecipientUIModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Recipient Name' }),
      key: 'description',
      dataIndex: 'description',
      defaultSortOrder: 'ascend',
      // width: 600,
      sorter: { compare: sortProp('description', defaultSort) }
    },
    ...(!notificationAdminContextualEnabled ? [] : [
      {
        title: $t({ defaultMessage: 'Recipient Type' }),
        dataIndex: 'recipientType',
        key: 'recipientType',
        filterMultiple: false,
        filterable: recipientTypeFilterOpts($t),
        sorter: true
      },
      {
        title: $t({ defaultMessage: 'Delivery Preference' }),
        dataIndex: 'deliveryPreference',
        key: 'deliveryPreference',
        sorter: true
      }
    ]),
    {
      title: $t({ defaultMessage: 'Email Address' }),
      key: 'email',
      dataIndex: 'email',
      sorter: { compare: sortProp('email', defaultSort) },
      render: (_, row) => {
        return renderDataWithStatus(row.email, row.emailEnabled)
      }
    },
    {
      title: $t({ defaultMessage: 'Mobile Phone' }),
      key: 'mobile',
      dataIndex: 'mobile',
      sorter: { compare: sortProp('mobile', defaultSort) },
      render: (_, row) => {
        return renderDataWithStatus(row.mobile, row.mobileEnabled)
      }
    }
  ]

  const rowActions: TableProps<NotificationRecipientUIModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        // show edit dialog
        setEditMode(true)
        setEditData(selectedRows[0])
        setShowDialog(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
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
      onClick: handleClickAddRecipient
    },
    {
      label: titleNotification,
      onClick: handleEnableIncidents
    }
  ]

  const isLoading = deleteOneState.isLoading || deleteMultipleState.isLoading

  return (
    <>
      <Loader states={[
        { isLoading: notificationList.isLoading, isFetching: isLoading }
      ]}>
        <Table
          columns={columns}
          dataSource={notificationList.data}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasCrossVenuesPermission() && hasAccess() && { type: 'checkbox' }}
          actions={hasCrossVenuesPermission() ? filterByAccess(tableActions) : []}
        />
      </Loader>

      <RecipientDialog
        visible={showDialog}
        setVisible={setShowDialog}
        editMode={editMode}
        editData={editData}
        isDuplicated={isDuplicated}
      />
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
