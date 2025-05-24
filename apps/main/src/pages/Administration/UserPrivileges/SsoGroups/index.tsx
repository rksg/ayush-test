import { useRef, useState } from 'react'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend }                  from 'react-dnd-html5-backend'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'


import {
  Button,
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Drag }                  from '@acx-ui/icons'
import {
  useGetAdminGroupsQuery,
  useDeleteAdminGroupsMutation,
  useUpdateAdminGroupsMutation
} from '@acx-ui/rc/services'
import { AdminGroup, sortProp, defaultSort, AdministrationUrlsInfo }                                  from '@acx-ui/rc/utils'
import { RolesEnum }                                                                                  from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, roleStringMap, hasAllowedOperations, getUserProfile } from '@acx-ui/user'
import { AccountType, getOpsApi }                                                                     from '@acx-ui/utils'

import { ShowMembersDrawer } from '../../Administrators/AdminGroups/ShowMembersDrawer'

import { AddSsoGroupDrawer } from './AddSsoGroupDrawer'

interface AdminGroupsTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

type DragItemProps = {
  id: string
}

export interface AdminSwapGroupData {
  name?: string,
  groupId?: string,
  swap: boolean,
  sourceGroupId: string,
  role: RolesEnum
}

const SsoGroups = (props: AdminGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<AdminGroup>({} as AdminGroup)
  const [membersGroupId, setMemberGroupId] = useState('')
  const [membersDrawerVisible, setMembersDrawerVisible] = useState(false)
  const { data: userProfileData } = useUserProfileContext()
  const { rbacOpsApiEnabled } = getUserProfile()
  const MAX_SSO_GROUP_ALLOWED = 20

  const { data: adminList, isLoading, isFetching } = useGetAdminGroupsQuery({ params })

  const [deleteAdminGroup, { isLoading: isDeleteAdminUpdating }] = useDeleteAdminGroupsMutation()
  const [updateAdminGroup] = useUpdateAdminGroupsMutation()

  const handleOpenDialog = () => {
    setShowDialog(true)
  }

  const handleClickAdd = () => {
    setEditMode(false)
    setEditData({} as AdminGroup)
    handleOpenDialog()
  }

  const columns:TableProps<AdminGroup>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      render: (_, row) => {
        return <Button
          size='small'
          type='link'
          onClick={(e) => {
            e.stopPropagation()
            setMemberGroupId(row.groupId as string)
            setMembersDrawerVisible(true)
          }}
          children={(row.name ?? '')}
        />
      }
    },
    {
      title: $t({ defaultMessage: 'Group ID' }),
      key: 'groupId',
      dataIndex: 'groupId'
    },
    {
      title: $t({ defaultMessage: 'Logged Members' }),
      key: 'loggedInMembers',
      show: false,
      dataIndex: 'loggedInMembers'
    },
    {
      title: $t({ defaultMessage: 'Privilege Group' }),
      key: 'role',
      dataIndex: 'role',
      render: function (_, row) {
        return roleStringMap[row.role as RolesEnum]
          ? $t(roleStringMap[row.role as RolesEnum]) : row.role
      }
    },
    {
      title: $t({ defaultMessage: 'Processing Priority' }),
      key: 'processingPriority',
      dataIndex: 'processingPriority',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('processingPriority', defaultSort) },
      align: 'center'
    },
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      render: (_, row) => {
        return <div data-testid={`${row.name}_Icon`} style={{ textAlign: 'center' }}>
          <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
        </div>
      }
    }
  ]

  const rowActions: TableProps<AdminGroup>['rowActions'] = [
    {
      visible: (selectedRows) => {
        if (selectedRows.length === 1) {
          return true
        } else {
          return false
        }
      },
      label: $t({ defaultMessage: 'Edit' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateAdminGroups)],
      onClick: (selectedRows) => {
        // show edit dialog
        setEditData(selectedRows[0])
        setEditMode(true)
        handleOpenDialog()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deleteAdminGroups)],
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Group' }),
            entityValue: rows.length === 1
              ? rows[0].name?.trim() || rows[0].groupId
              : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteAdminGroup({ params, payload: rows.map(item => item.id) })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const onSwap = async (targetGroupId: string, sourceGroupId: string) => {
    try {
      const adminGroupEditData: AdminGroup = {
        swapPriority: true,
        sourceGroupId: sourceGroupId
      }

      await updateAdminGroup({ params: { groupId: targetGroupId },
        payload: adminGroupEditData }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const tableActions = []
  const hasPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.addAdminGroups)])
    : isPrimeAdminUser
  if (hasPermission && tenantType !== AccountType.MSP_REC &&
    (adminList && adminList.length < MAX_SSO_GROUP_ALLOWED)) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add SSO Group' }),
      onClick: handleClickAdd
    })
  }

  const hasRowPermissions = rbacOpsApiEnabled ? filterByAccess(rowActions).length > 0
    : isPrimeAdminUser

  // @ts-ignore
  const DraggableRow = (props) => {
    const ref = useRef(null)
    const { className, onClick, ...restProps } = props

    const [, drag] = useDrag(() => ({
      type: 'DraggableRow',
      item: {
        id: props['data-row-key']
      },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    }))

    const [{ isOver }, drop] = useDrop({
      accept: 'DraggableRow',
      drop: (item: DragItemProps) => {
        // @ts-ignore
        const hoverIdx = String(ref.current.getAttribute('data-row-key'))
        const idx = item.id ?? -1
        if (idx && idx !== hoverIdx) {
          onSwap(idx, hoverIdx)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    })

    drag(drop(ref))

    return (
      <tr
        ref={ref}
        className={className}
        onClick={onClick}
        {...restProps}
        style={isOver ? {
          backgroundColor: 'var(--acx-accents-blue-10)',
          borderColor: 'var(--acx-accents-blue-10)'
        } : {}}
      >
        {props.children}
      </tr>
    )
  }

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteAdminUpdating
      }
    ]}>
      <DndProvider backend={HTML5Backend} >
        <Table style={{ paddingBottom: '40px' }}
          columns={columns}
          dataSource={adminList}
          rowKey='id'
          rowActions={hasRowPermissions
            ? filterByAccess(rowActions)
            : undefined}
          rowSelection={hasRowPermissions ? {
            type: 'checkbox'//,
          // onSelect: handleRowSelectChange
          } : undefined}
          actions={filterByAccess(tableActions)}
          components={{
            body: {
              row: DraggableRow
            }
          }}
          // set defaultPageSize to 10000 (big number) to hide pagination for this table
          pagination={{ defaultPageSize: 10000 }}
          data-testid='AdminGroupTable'
        />
      </DndProvider>
      {showDialog && <AddSsoGroupDrawer
        visible={showDialog}
        setVisible={setShowDialog}
        isEditMode={editMode}
        editData={editMode ? editData : undefined}
        groupData={adminList}
      />}
      {membersDrawerVisible && <ShowMembersDrawer
        visible={membersDrawerVisible}
        setVisible={setMembersDrawerVisible}
        membersGroupId={membersGroupId}
      />}
    </Loader>
  )
}

export default SsoGroups
