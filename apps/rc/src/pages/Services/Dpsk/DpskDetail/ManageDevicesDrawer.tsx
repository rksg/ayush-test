import React, { useEffect, useState } from 'react'

import { Form, Input }                   from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import moment                            from 'moment'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Button, Drawer, Modal, Table, TableProps }         from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { defaultClientPayload, useDpskNewConfigFlowParams } from '@acx-ui/rc/components'
import {
  useDeleteDpskPassphraseDevicesMutation, useGetClientListQuery,
  useGetDpskPassphraseDevicesQuery, useGetDpskQuery, useNetworkListQuery,
  useUpdateDpskPassphraseDevicesMutation
} from '@acx-ui/rc/services'
import {
  DPSKDeviceInfo,
  FILTER,
  SEARCH,
  NewDpskPassphrase,
  MacRegistrationFilterRegExp,
  useTableQuery,
  usePollingTableQuery,
  sortProp,
  defaultSort,
  dateSort,
  EXPIRATION_TIME_FORMAT
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
  const [searchString, setSearchString] = useState('')
  const [form] = Form.useForm()

  const macAddress = useWatch<string>('macAddress', form)
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const [deviceOnlineList, setDeviceOnlineList] = useState({} as { [key: string]: boolean })
  const isNewConfigFlow = useIsSplitOn(Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)

  const { data: devicesData } = useGetDpskPassphraseDevicesQuery({
    params: {
      ...params,
      passphraseId: passphraseInfo.id,
      ...dpskNewConfigFlowParams
    }
  })

  const { data } = useGetDpskQuery({ params: { ...params, ...dpskNewConfigFlowParams } })

  const connectedDevices = devicesData?.filter(d => d.deviceConnectivity === 'CONNECTED') || []
  const connectedDeviceMacs = connectedDevices.map(device => device.mac)

  const clientTableQuery = usePollingTableQuery({
    useQuery: useGetClientListQuery,
    defaultPayload: {
      ...defaultClientPayload,
      filters: { clientMac: connectedDeviceMacs }
    },
    pagination: {
      pageSize: 10000
    },
    search: {
      searchTargetFields: defaultClientPayload.searchTargetFields
    }
  })

  useEffect(() => {
    if (clientTableQuery.data) {
      setDeviceOnlineList(clientTableQuery.data.data.reduce((o, client) => {
        if (!o.hasOwnProperty(client.clientMac)) o[client.clientMac] = true
        return o
      }, {} as { [key: string]: boolean }))
    }
  }, [clientTableQuery.data])

  useEffect(() => {
    if (data?.networkIds?.length) {
      tableQuery.setPayload({
        fields: ['name', 'id'],
        filters: {
          id: data.networkIds
        }
      })
    }
  }, [data])

  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      fields: ['name', 'id'],
      filters: { id: data?.networkIds }
    }
  })

  const getNetworkId = (networkName: string) => {
    if (tableQuery.data && tableQuery.data.data) {
      const networkIdx = tableQuery.data.data.findIndex(network => network.name === networkName)
      return networkIdx !== -1 ? tableQuery.data.data[networkIdx].id : ''
    }
    return ''
  }

  const getOnlineStatus = (row: DPSKDeviceInfo) => {
    if (isNewConfigFlow) {
      const dateContent = row.lastConnectedTime
        ? moment(row.lastConnectedTime).format(EXPIRATION_TIME_FORMAT)
        : '-'
      return deviceOnlineList.hasOwnProperty(row.mac)
        ? $t({ defaultMessage: 'Online' })
        : dateContent
    } else {
      const dateContent = row.lastConnected
        ? new Date(row.lastConnected + ' GMT').toLocaleString()
        : '-'
      return row.online
        ? $t({ defaultMessage: 'Online' })
        : dateContent
    }
  }

  const [updateDevicesData] = useUpdateDpskPassphraseDevicesMutation()
  const [deleteDevicesData] = useDeleteDpskPassphraseDevicesMutation()

  const columns: TableProps<DPSKDeviceInfo>['columns'] = [
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) },
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row) => {
        return row.lastConnected === 'Online' ? <TenantLink
          to={`/users/wifi/clients/${row.mac}/details/`}>
          {row.mac}
        </TenantLink>: row.mac
      }
    },
    {
      key: 'online',
      title: $t({ defaultMessage: 'Last Seen' }),
      dataIndex: 'online',
      sorter: { compare: sortProp(isNewConfigFlow ? 'lastConnectedTime' : 'online', dateSort) },
      render: (_, row) => {
        return getOnlineStatus(row)
      }
    },
    {
      key: 'lastConnectedNetwork',
      title: $t({ defaultMessage: 'Last Network' }),
      dataIndex: 'lastConnectedNetwork',
      sorter: { compare: sortProp('lastConnectedNetwork', defaultSort) },
      render: (_, row) => {
        return row.lastConnectedNetwork? <TenantLink
          // eslint-disable-next-line max-len
          to={`networks/wireless/${getNetworkId(row.lastConnectedNetwork)}/network-details/overview`}>
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
            passphraseId: passphraseInfo.id,
            ...dpskNewConfigFlowParams
          },
          payload: isNewConfigFlow
            ? rows.map(row => row.mac)
            : {
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
    form.resetFields()
  }

  const onClose = () => {
    setVisible(false)
  }

  const onOk = async () => {
    try {
      await form.validateFields()
      await updateDevicesData({
        params: {
          ...params,
          passphraseId: passphraseInfo.id,
          ...dpskNewConfigFlowParams
        },
        payload: isNewConfigFlow
          ? [macAddress]
          : {
            id: passphraseInfo.id,
            devicesMac: [
              macAddress
            ],
            poolId: params.serviceId,
            tenantId: params.tenantId
          }
      })

      if (!addAnother) {
        setModalVisible(false)
      } else {
        if (devicesData &&
          passphraseInfo.numberOfDevices! - 1 === devicesData.length + 1
        ) setAddAnother(false)
      }
      form.resetFields()
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

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    if (customSearch.searchString && customSearch.searchString !== '') {
      setSearchString(customSearch.searchString.toLowerCase())
    } else {
      setSearchString('')
    }
  }

  const deviceTable = <Table<DPSKDeviceInfo>
    onFilterChange={handleFilterChange}
    columns={columns}
    actions={actions}
    dataSource={devicesData?.filter(data => {
      return searchString ? data.mac.toLowerCase().includes(searchString) : true
    })}
    enableApiFilter={false}
    pagination={{ defaultPageSize: 10000, hideOnSinglePage: true }}
    rowKey='mac'
    rowActions={rowActions}
    rowSelection={{ type: 'checkbox' }}
  />

  const footer = [
    <div key='checkbox-wrapper' style={{ float: 'left', lineHeight: '32px' }}>
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
    <Button key='ok' onClick={onOk} type='primary'>
      {$t({ defaultMessage: 'Add' })}
    </Button>
  ]

  const filterWithoutFormat = (mac: string, value: string) => {
    const regex = /[.\-:]/gi
    let macStr = mac.replace(regex, '').toLowerCase()
    let valueStr = value.replace(regex, '').toLowerCase()
    return macStr === valueStr
  }

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
            onCancel={onClose}
          />
        }
        width={'700px'}
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
              { validator: (_, value) => {
                if (devicesData?.map(deviceData => deviceData.mac)
                  .filter(mac => filterWithoutFormat(mac, value)).length) {
                  return Promise.reject($t({
                    defaultMessage: 'MAC address {macAddress} already exists'
                  }, { macAddress: value }))
                }
                return MacRegistrationFilterRegExp(value)
              } }
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
