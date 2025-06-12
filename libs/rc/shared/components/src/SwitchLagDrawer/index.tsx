
import { useState } from 'react'

import {
  Space } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button,
  Drawer,
  Loader,
  showActionModal,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  DeleteOutlined,
  EditOutlined
} from '@acx-ui/icons-new'
import {
  useDeleteLagMutation,
  useGetLagListQuery,
  useSwitchDetailHeaderQuery
}                            from '@acx-ui/rc/services'
import { Lag, isOperationalSwitch } from '@acx-ui/rc/switch/utils'
import {
  SwitchRbacUrlsInfo
}      from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { SwitchScopes }                  from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getOpsApi }                     from '@acx-ui/utils'

import { SwitchLagModal } from './SwitchLagModal'

interface SwitchLagProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const SwitchLagDrawer = (props: SwitchLagProps) => {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { visible, setVisible } = props
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [ deleteLag ] = useDeleteLagMutation()
  const { data: switchDetail, isLoading: isSwitchDetailLoading }
    = useSwitchDetailHeaderQuery({ params: { tenantId, switchId } })
  const { data, isLoading } = useGetLagListQuery({
    params: { tenantId, switchId, venueId: switchDetail?.venueId },
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !switchDetail?.venueId || isSwitchDetailLoading
  })

  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [row, setRow] = useState([] as Lag[])
  const isOperational = switchDetail?.deviceStatus ?
    isOperationalSwitch(switchDetail?.deviceStatus, switchDetail.syncedSwitchConfig) : false


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
            dottedUnderline
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
          { hasPermission({
            scopes: [SwitchScopes.UPDATE],
            rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateLag)]
          }) && <Button
            type='link'
            key='edit'
            role='editBtn'
            disabled={!isOperational}
            icon={<EditOutlined size='sm' />}
            style={{ height: '16px' }}
            onClick={() => handleEdit(row)}
          />}
          { hasPermission({
            scopes: [SwitchScopes.DELETE],
            rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteLag)]
          }) && <Button
            type='link'
            key='delete'
            role='deleteBtn'
            disabled={!isOperational}
            icon={<DeleteOutlined size='sm' />}
            style={{ height: '16px' }}
            onClick={() => handleDelete(row)}
          />}
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
        await deleteLag({
          params: { tenantId, switchId, venueId: switchDetail?.venueId, lagId: row.id },
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
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
        type='primary'
        onClick={onClose}>
        {$t({ defaultMessage: 'OK' })}
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
              { isLoading: isLoading || isSwitchDetailLoading }
            ]}
          >
            <Table
              columns={columns}
              type='compact'
              dataSource={data}
              rowKey='name'
              actions={filterByAccess([{
                label: $t({ defaultMessage: 'Add LAG' }),
                scopeKey: [SwitchScopes.CREATE],
                rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addLag)],
                disabled: !isOperational,
                onClick: () => {
                  setModalVisible(true)
                  setIsEditMode(false)
                }
              }])}
            />
          </Loader>
        }
      />
      { switchDetail && <SwitchLagModal
        isEditMode={isEditMode}
        editData={row}
        visible={modalVisible}
        setVisible={setModalVisible}
      />}
    </>
  )
}
