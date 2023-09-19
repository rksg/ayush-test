import { useState } from 'react'

import { Row, Col, Badge, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

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
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { PreferenceDrawer } from './PreferenceDrawer'
import RecipientDialog      from './RecipientDialog'
import * as UI              from './styledComponents'

const FunctionEnabledStatusLightConfig = {
  active: {
    color: 'var(--acx-semantics-green-50)'
  },
  inActive: {
    color: 'var(--acx-neutrals-50)'
  }
}

export const NotificationsTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
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
      width: 600,
      sorter: { compare: sortProp('description', defaultSort) }
    },
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

  const tableActions = [{
    label: $t({ defaultMessage: 'Add Recipient' }),
    onClick: handleClickAddRecipient
  }]

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
          rowSelection={hasAccess() && { type: 'checkbox' }}
          actions={filterByAccess(tableActions)}
        />
      </Loader>

      <RecipientDialog
        visible={showDialog}
        setVisible={setShowDialog}
        editMode={editMode}
        editData={editData}
        isDuplicated={isDuplicated}
      />
    </>
  )
}

const Notifications = () => {
  const { $t } = useIntl()
  const mspUtils = MSPUtils()
  const { data: mspProfile } = useGetMspProfileQuery({})
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
            {$t({ defaultMessage: 'Preference' })}
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
