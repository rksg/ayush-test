import { useState, useEffect } from 'react'

import { Empty }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetMspEcDelegationsQuery,
  useGetDelegationsQuery,
  useRevokeInvitationMutation
} from '@acx-ui/rc/services'
import {
  AdministrationDelegationStatus,
  Delegation,
  UserProfile
} from '@acx-ui/rc/utils'

import DelegationInviteDialog from '../DelegationInviteDialog'


interface AdministrationDelegationsTableProps {
  isMspEc: boolean;
  userProfileData: UserProfile | undefined;
}

const AdministrationDelegationsTable = (props: AdministrationDelegationsTableProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { isMspEc, userProfileData } = props
  const [showDialog, setShowDialog] = useState(false)
  const [isTenantLocked, setIsTenantLocked] = useState(false)

  const {
    data: mspEcDelegationData,
    isLoading: isLoadingEcDelegation,
    isFetching: isFetchingEcDelegation
  } = useGetMspEcDelegationsQuery({ params }, { skip: !isMspEc })
  const {
    data: delegationData,
    isLoading: isLoadingDelegation,
    isFetching: isFetchingDelegation
  }= useGetDelegationsQuery({ params }, { skip: isMspEc })

  const [revokeInvitation] = useRevokeInvitationMutation()

  const hasDelegations = isMspEc ? isLoadingEcDelegation : Boolean(delegationData?.data?.length)
  const isSupport = userProfileData?.support


  const handleClickInviteDelegation = () => {
    setShowDialog(true)
  }

  const delegationRevokeInvitation= (rowData: Delegation) => {
    setIsTenantLocked(true)

    const paramValues = {
      tenantId: params.tenantId,
      delegationId: rowData.id
    }

    revokeInvitation(paramValues)
  }

  const handleClickRevokeInvitation = (rowData: Delegation) => () => {
    const isCancel = (rowData.status === AdministrationDelegationStatus.INVITED
        || rowData.status === AdministrationDelegationStatus.REJECTED)

    showActionModal({
      type: 'confirm',
      // eslint-disable-next-line max-len
      title: isCancel ? $t({ defaultMessage: 'Cancel invitation?' }) : $t({ defaultMessage: 'Revoke Access' }),
      content: isCancel
      // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'Are you sure you want to cancel the invitation of 3rd party administrator {name}?' }, { name: rowData.delegatedToName })
      // eslint-disable-next-line max-len
        : $t({ defaultMessage: 'Are you sure you want to revoke access of partner {name}?' }, { name: rowData.delegatedToName }),
      okText: isCancel
        ? $t({ defaultMessage: 'Cancel Invitation' })
        : $t({ defaultMessage: 'Yes, revoke access' }),
      cancelText: isCancel
        ? $t({ defaultMessage: 'Keep invitation' })
        : $t({ defaultMessage: 'No, keep access grant' }),
      onOk: () => {
        delegationRevokeInvitation(rowData)
      }
    })
  }

  const columns: TableProps<Delegation>['columns'] = [
    {
      title: isMspEc ? $t({ defaultMessage: 'MSP Name' }) : $t({ defaultMessage: 'Partner Name' }),
      key: 'delegatedToName',
      dataIndex: 'delegatedToName',
      render: (data, row) => {
        return row.delegatedToName
      }
    }
  ]


  if (isMspEc !== true) {
    columns.push({
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      render: (_, row) => {
        return row.statusLabel
      }
    })

    // TODO: rbacService.isRoleAllowed('RevokeInvitationButton')
    if (!isSupport) {
      columns.push({
        title: $t({ defaultMessage: 'Action' }),
        key: 'action',
        dataIndex: 'action',
        render: (_, row) => {
          return <Button
            onClick={handleClickRevokeInvitation(row)}
            disabled={isTenantLocked}
          >
            {
              row.status === AdministrationDelegationStatus.ACCEPTED
                ? $t({ defaultMessage: 'Revoke access' })
                : $t({ defaultMessage: 'Cancel invitation' })
            }
          </Button>
        }
      })
    }
  }

  // TODO: setIsTenantLocked(false) afetr received activity notification
  // await onSocketActivityChanged(requestArgs, api, (msg) => {
  //   setIsTenantLocked(false)
  // })


  useEffect(() => {
    // FIXME: isfectching also invoked when error?
    setIsTenantLocked(false)
  }, [isFetchingEcDelegation])


  const tableActions = []
  if (isMspEc !== true && isSupport === false) {
    tableActions.push({
      /* TODO: hide: !rbacService.isRoleAllowed('Invite3rdPartyButton') */
      label: $t({ defaultMessage: 'Invite 3rd Party Administrator' }),
      disabled: hasDelegations,
      onClick: handleClickInviteDelegation
    })
  }

  const tableData = isMspEc ? mspEcDelegationData : delegationData

  return (
    <>
      <Loader states={[
        { isLoading: isLoadingEcDelegation || isLoadingDelegation,
          isFetching: isFetchingEcDelegation || isFetchingDelegation
        }
      ]}>
        <Table
          headerTitle={isMspEc ?
            $t({ defaultMessage: 'MSP Administrators' }) :
            $t({ defaultMessage: '3rd Party Administrator' })}
          // TODO:
          // subTitle={isMspEc ? '' : $t({ defaultMessage: 'You can delegate access rights to a 3rd party administrator.' }) }
          columns={columns}
          dataSource={tableData?.data}
          rowKey='id'
          locale={{
            // eslint-disable-next-line max-len
            emptyText: <Empty description={$t({ defaultMessage: 'No 3rd Party Administrator Invited' })} />
          }}
          actions={tableActions}
        />

      </Loader>
      <DelegationInviteDialog
        visible={showDialog}
        setVisible={setShowDialog}
      />
    </>
  )
}

export default AdministrationDelegationsTable