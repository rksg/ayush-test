
import { useState } from 'react'

import {
  Space } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { DeleteOutlinedIcon, EditOutlinedIcon }                                from '@acx-ui/icons'
import { useDeleteLagMutation, useGetLagListQuery }                            from '@acx-ui/rc/services'
import { Lag }                                                                 from '@acx-ui/rc/utils'
import { useParams }                                                           from '@acx-ui/react-router-dom'

import { SwitchLagModal } from './switchLagModal'

interface SwitchLagProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const SwitchLagDrawer = (props: SwitchLagProps) => {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { visible, setVisible } = props

  const { data, isLoading } = useGetLagListQuery({ params: { tenantId, switchId } })
  const [deleteLag] = useDeleteLagMutation()

  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [row, setRow] = useState([] as Lag[])

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<Lag>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'LAG Name' }),
      sorter: false,
      dataIndex: 'name'
    }, {
      key: 'type',
      title: $t({ defaultMessage: 'LAG Type' }),
      sorter: false,
      dataIndex: 'type',
      render: function (data) {
        return _.isString(data) ? _.capitalize(data) : ''
      }
    }, {
      key: 'ports',
      title: $t({ defaultMessage: 'Ports' }),
      sorter: false,
      dataIndex: 'ports',
      render: function (data, row) {
        if (Array.isArray(data)) {
          return <Tooltip
            placement='bottom'
            title={row.ports.map(p => {
              return (<span>{p}<br /></span>)
            })} >
            {data.length}
          </Tooltip>
        } else {
          return
        }
      }
    }, {
      key: 'action',
      dataIndex: 'action',
      render: function (data, row) {
        return <>
          <Button
            key='edit'
            role='editBtn'
            ghost={true}
            icon={<EditOutlinedIcon />}
            style={{ height: '16px' }}
            onClick={() => handleEdit(row)}
          />
          <Button
            key='delete'
            role='deleteBtn'
            ghost={true}
            icon={<DeleteOutlinedIcon />}
            style={{ height: '16px' }}
            onClick={() => handleDelete(row)}
          />
        </>
      }
    }]

  const handleDelete = (row: Lag) => {
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'Delete {lagName}' }, { lagName: row.name }),
      content: $t({
        defaultMessage: 'Are you sure you want to delete this LAG?' }),
      okText: $t({ defaultMessage: 'OK' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: async () => {
        await deleteLag({ params: { lagId: row.id, tenantId } }).unwrap()
      },
      onCancel: async () => {}
    })
  }

  const handleEdit = (row: Lag) => {
    setModalVisible(true)
    setIsEditMode(true)
    setRow([row])
  }

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='secondary'
        onClick={onClose}>
        {$t({ defaultMessage: 'Ok' })}
      </Button>
    </Space>
  ]

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Manage LAG' })}
        visible={visible}
        onClose={onClose}
        width={644}
        footer={footer}
        children={
          <Loader
            states={[
              { isLoading }
            ]}
          >
            <Table
              columns={columns}
              type='compact'
              dataSource={data}
              rowKey='name'
              actions={
                [{
                  label: $t({ defaultMessage: 'Add LAG' }),
                  onClick: () => {
                    setModalVisible(true)
                    setIsEditMode(false)
                  }
                }]

              }
            />
          </Loader>
        }
      />
      {<SwitchLagModal
        isEditMode={isEditMode}
        editData={row}
        visible={modalVisible}
        setVisible={setModalVisible}
      />}
    </>
  )
}
