import React, { useState } from 'react'

import { Form, Input }                   from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Button, Drawer, Modal, Table, TableProps } from '@acx-ui/components'
import {
  useDeleteDpskPassphraseDevicesMutation,
  useGetDpskPassphraseDevicesQuery,
  useUpdateDpskPassphraseDevicesMutation
} from '@acx-ui/rc/services'
import {
  DPSKDeviceInfo,
  MacAddressFilterRegExp,
  NewDpskPassphrase
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export interface ManageDeviceDrawerProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  passphraseInfo: NewDpskPassphrase;
  setPassphraseInfo: (i: NewDpskPassphrase) => void;
}

const { useWatch } = Form

const ManageDevicesDrawer = (props: ManageDeviceDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, passphraseInfo } = props
  const params = useParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [addAnother, setAddAnother] = useState(false)
  const [form] = Form.useForm()

  const macAddress = useWatch<string>('macAddress', form)

  const { data: devicesData } = useGetDpskPassphraseDevicesQuery({
    params: {
      ...params,
      passphraseId: passphraseInfo.id
    }
  }, { skip: !Object.keys(passphraseInfo).length && !passphraseInfo.id })

  const [updateDevicesData] = useUpdateDpskPassphraseDevicesMutation()
  const [deleteDevicesData] = useDeleteDpskPassphraseDevicesMutation()

  const columns: TableProps<DPSKDeviceInfo>['columns'] = [
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (data, row) => {
        return <TenantLink
          to={`/users/wifi/clients/${row.mac}/details/`}>{row.mac}</TenantLink>
      }
    },
    {
      key: 'lastConnected',
      title: $t({ defaultMessage: 'Last Seen' }),
      dataIndex: 'lastConnected',
      sorter: true
    },
    {
      key: 'lastConnectedNetwork',
      title: $t({ defaultMessage: 'Last Network' }),
      dataIndex: 'lastConnectedNetwork',
      sorter: true,
      render: (data, row) => {
        return row.lastConnectedNetwork ? <TenantLink
          to={`networks/wireless/${row.lastConnectedNetwork}/network-details/overview`}>
          {row.lastConnectedNetwork}
        </TenantLink> : ''
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Device' }),
      // eslint-disable-next-line max-len
      disabled: !!(passphraseInfo.numberOfDevices && devicesData && devicesData.length >= passphraseInfo.numberOfDevices),
      onClick: () => {
        setModalVisible(true)
      }
    }
  ]

  const rowActions: TableProps<DPSKDeviceInfo>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: async (rows, clearSelection) => {
        await deleteDevicesData({
          params: {
            ...params,
            passphraseId: passphraseInfo.id
          },
          payload: {
            id: passphraseInfo.id,
            devicesMac: rows.map(row => row.mac),
            poolId: params.serviceId,
            tenantId: params.tenantId
          }
        })
        clearSelection()
      }
    }
  ]

  const onCancel = () => {
    setModalVisible(false)
  }

  const onClose = () => {
    setVisible(false)
  }

  const onOk = async () => {
    try {
      const valid = await form.validateFields()
      if (valid) {
        await updateDevicesData({
          params: {
            ...params,
            passphraseId: passphraseInfo.id
          },
          payload: {
            id: passphraseInfo.id,
            devicesMac: [
              macAddress
            ],
            poolId: params.serviceId,
            tenantId: params.tenantId
          }
        })

        if (addAnother) {
          form.setFieldValue('macAddress', '')
        } else {
          setModalVisible(false)
        }
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isExceed = () => {
    if (passphraseInfo.numberOfDevices && devicesData) {
      return passphraseInfo.numberOfDevices! <= devicesData.length + 1
    }
    return false
  }

  const deviceTable = <Table<DPSKDeviceInfo>
    columns={columns}
    actions={actions}
    dataSource={devicesData}
    enableApiFilter={true}
    rowKey='mac'
    rowActions={rowActions}
    rowSelection={{ type: 'checkbox' }}
  />

  const footer = [
    <div style={{ float: 'left', lineHeight: '32px' }}>
      <Checkbox
        onChange={(e: CheckboxChangeEvent) => setAddAnother(e.target.checked)}
        disabled={isExceed()}
        checked={addAnother}
        children={$t({ defaultMessage: 'Add another device' })}
      />
    </div>,
    <Button key='cancel' onClick={onCancel}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>,
    <Button key='ok' onClick={onOk} type='secondary'>
      {$t({ defaultMessage: 'Add' })}
    </Button>
  ]

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Manage Passphrase Devices' })}
        visible={visible}
        onClose={onClose}
        destroyOnClose={true}
        zIndex={100}
        children={deviceTable}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={false}
            buttonLabel={({
              save: $t({ defaultMessage: 'Cancel' })
            })}
            onCancel={onClose}
          />
        }
        width={'500px'}
      />
      <Modal
        title={$t({ defaultMessage: 'Add Device' })}
        zIndex={1000}
        visible={modalVisible}
        okText={$t({ defaultMessage: 'Add' })}
        width={650}
        footer={footer}
        onCancel={onCancel}
        onOk={onOk}
      >
        <Form form={form}>
          <Form.Item
            name='macAddress'
            label={$t({ defaultMessage: 'MAC Address' })}
            rules={[
              { required: true },
              { validator: (_, value) => MacAddressFilterRegExp(value) }
            ]}
            labelCol={{ span: 24 }}
            validateFirst
            initialValue={''}
            hasFeedback
            children={<Input />}
          />
        </Form>
      </Modal>
    </>
  )
}

export default ManageDevicesDrawer
