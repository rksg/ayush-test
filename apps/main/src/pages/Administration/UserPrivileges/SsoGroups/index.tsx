import { Dispatch, useEffect, useRef, useState } from 'react'

import { InputNumber, Space, Spin }      from 'antd'
import { debounce, isEmpty }             from 'lodash'
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
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Drag }                   from '@acx-ui/icons'
import {
  useGetAdminGroupsQuery,
  useDeleteAdminGroupsMutation,
  useUpdateAdminGroupsMutation
} from '@acx-ui/rc/services'
import { AdminGroup, sortProp, defaultSort }                    from '@acx-ui/rc/utils'
import { RolesEnum }                                            from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, roleStringMap } from '@acx-ui/user'
import { AccountType }                                          from '@acx-ui/utils'

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

const MAX_SSO_GROUP_ALLOWED = 100

const ProcessingPriorityComponent = function (props: {
    maxAllowedPriority: number,
    isEditing: boolean
    priority: number,
    rowKey: string,
    isLoading: boolean,
  onPriorityChange: (priorityNumber: number) => void,
  onStartEdit: Dispatch<React.SetStateAction<string>> }) {

  const { maxAllowedPriority, isEditing, priority, rowKey, isLoading,
    onPriorityChange, onStartEdit } = props
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  return isEditing
    ? <Spin spinning={isLoading}><InputNumber
      ref={inputRef}
      disabled={isLoading}
      min={1}
      controls={true}
      autoFocus={true}
      max={maxAllowedPriority || MAX_SSO_GROUP_ALLOWED}
      onClick={(e) => e.stopPropagation()}
      onChange={debounce((value) => {
        if(value !== priority) {
          onPriorityChange(value)
        }
      }, 500)}
      defaultValue={priority}/>
    </Spin>
    : <Button
      disabled={isLoading}
      onClick={(e) => {
        e.stopPropagation()
        return onStartEdit(rowKey) }}
      type='link'>{priority}</Button>
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
  const [editingRowKey, setEditingRowKey] = useState('')
  const [isPriorityChangeLoading, setIsPriorityChangeLoading] = useState(false)
  const { data: userProfileData } = useUserProfileContext()
  const isSSOLimit100Toggle = useIsSplitOn(Features.SSO_GROUP_LIMIT100)

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

  const changeProcessingPiority = async (sourceGroupId: string, priorityNumber: number) => {
    const adminGroupEditData: AdminGroup = {
      swapPriority: true,
      sourceGroupId: sourceGroupId
    }
    const targetAdmin = adminList?.filter(admin => admin.processingPriority === +priorityNumber)
    if (targetAdmin && !isEmpty(targetAdmin)) {
      setIsPriorityChangeLoading(true)
      await updateAdminGroup({ params: { groupId: targetAdmin[0].id },
        payload: adminGroupEditData }).unwrap()
      setIsPriorityChangeLoading(false)
      setEditingRowKey('')
    }
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
      align: 'center',
      render: function (_, row) {
        return isSSOLimit100Toggle
          ? <Space key={row.id}
            onClick={(e) => e.stopPropagation()}><ProcessingPriorityComponent
              maxAllowedPriority={adminList?.length as number}
              rowKey={row.id as string}
              isEditing={editingRowKey === row.id}
              priority={row.processingPriority || 0}
              onStartEdit={setEditingRowKey}
              isLoading={isPriorityChangeLoading}
              onPriorityChange={(priorityNumber) =>
                changeProcessingPiority(row.id as string, priorityNumber)}/>
          </Space>
          : row.processingPriority
      }
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
      onClick: (selectedRows) => {
        // show edit dialog
        setEditData(selectedRows[0])
        setEditMode(true)
        handleOpenDialog()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
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
  if (isPrimeAdminUser && tenantType !== AccountType.MSP_REC &&
    (adminList && adminList.length < MAX_SSO_GROUP_ALLOWED)) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add SSO Group' }),
      onClick: handleClickAdd
    })
  }

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
          rowActions={isPrimeAdminUser
            ? filterByAccess(rowActions)
            : undefined}
          rowSelection={isPrimeAdminUser ? {
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
