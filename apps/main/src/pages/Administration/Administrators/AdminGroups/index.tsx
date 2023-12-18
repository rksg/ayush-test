import { useRef, useState } from 'react'
import React                from 'react'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend }                  from 'react-dnd-html5-backend'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Drag }                  from '@acx-ui/icons'
import {
  useGetAdminGroupsQuery,
  useDeleteAdminGroupsMutation
} from '@acx-ui/rc/services'
import { AdminGroup, sortProp, defaultSort }                    from '@acx-ui/rc/utils'
import { filterByAccess, useUserProfileContext, roleStringMap } from '@acx-ui/user'
import { AccountType }                                          from '@acx-ui/utils'

import { AddGroupDrawer } from './AddGroupDrawer'


interface AdminGroupsTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

type DragItemProps = {
  processingPriority: number
}

const AdminGroups = (props: AdminGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<AdminGroup>({} as AdminGroup)
  const { data: userProfileData } = useUserProfileContext()

  const { data: adminList, isLoading, isFetching } = useGetAdminGroupsQuery({ params })

  const [deleteAdminGroup, { isLoading: isDeleteAdminUpdating }] = useDeleteAdminGroupsMutation()

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
      title: $t({ defaultMessage: 'Group Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('fullName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Group ID' }),
      key: 'groupId',
      dataIndex: 'groupId',
      sorter: { compare: sortProp('groupId', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Processing Priority' }),
      key: 'processingPriority',
      dataIndex: 'processingPriority',
      sorter: { compare: sortProp('processingPriority', defaultSort) }
    },
    // {
    //   title: $t({ defaultMessage: 'Logged Members' }),
    //   key: 'loggedMembers',
    //   dataIndex: 'loggedMembers',
    //   sorter: { compare: sortProp('email', defaultSort) }
    // },
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'role',
      dataIndex: 'role',
      sorter: { compare: sortProp('role', defaultSort) },
      render: function (_, row) {
        return row.customRole?.name ? $t(roleStringMap[row.customRole.name]) : ''
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
      // visible: (selectedRows) => {
      //   const allPrimeAdminSelected = isAllPrimeAdminSelected(selectedRows)
      //   const selfSelected = isSelfSelected(selectedRows)
      //   if (selfSelected) return false
      //   return allPrimeAdminSelected === false
      // },
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Group' }),
            entityValue: rows[0].name
            // entityValue: rows.length === 1
            //   ? rows[0].name !== ' ' ? rows[0].name : rows[0].groupId
            //   : undefined,
            // numOfEntities: rows.length
          },
          onOk: () => {
            deleteAdminGroup({ params: { ...params, groupId: rows[0].id } })
              .then(clearSelection)

            // rows.length === 1 ?
            //   deleteAdminGroup({ params: { ...params, groupId: rows[0].id } })
            //     .then(clearSelection) :
            //   deleteAdmins({ params, payload: rows.map(item => item.groupId) })
            //     .then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = []
  if (isPrimeAdminUser && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add Group' }),
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
        processingPriority: props['data-row-key']
      },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    }))

    const [{ isOver }, drop] = useDrop({
      accept: 'DraggableRow',
      drop: (item: DragItemProps) => {
        // @ts-ignore
        const hoverIdx = Number(ref.current.getAttribute('data-row-key'))
        const idx = item.processingPriority ?? -1
        if (idx && idx !== hoverIdx) {
          // dispatch({
          //   type: RogueAPDetectionActionTypes.DRAG_AND_DROP,
          //   payload: {
          //     oldIndex: idx - 1, newIndex: hoverIdx - 1
          //   }
          // })
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
        <Table
          columns={columns}
          dataSource={adminList}
          rowKey='processingPriority'
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
        />
      </DndProvider>

      { editMode ?
        <AddGroupDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          isEditMode={editMode}
          editData={editData}
        /> :
        <AddGroupDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          isEditMode={editMode}
        />}
    </Loader>
  )
}

export default AdminGroups
