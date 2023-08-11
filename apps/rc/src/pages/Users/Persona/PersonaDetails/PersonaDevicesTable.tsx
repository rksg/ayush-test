import { useEffect, useState } from 'react'

import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, Subtitle, Table, TableProps, Tooltip } from '@acx-ui/components'
import { SuccessSolid }                                                  from '@acx-ui/icons'
import { OSIconContainer }                                               from '@acx-ui/rc/components'
import {
  useAddPersonaDevicesMutation,
  useDeletePersonaDevicesMutation,
  useGetDpskPassphraseDevicesQuery,
  useLazyGetClientListQuery
} from '@acx-ui/rc/services'
import {
  ClientList,
  dateSort,
  defaultSort,
  DPSKDeviceInfo,
  getOsTypeIcon,
  Persona,
  PersonaDevice,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { noDataDisplay }             from '@acx-ui/utils'

import { PersonaDeviceItem }          from '../PersonaForm/PersonaDevicesForm'
import { PersonaDevicesImportDialog } from '../PersonaForm/PersonaDevicesImportDialog'

const defaultPayload = {
  searchString: '',
  searchTargetFields: ['clientMac', 'ipAddress', 'Username', 'hostname', 'osType'],
  fields: ['hostname','osType','clientMac','ipAddress','Username', 'venueName',
    'apName', 'lastUpdateTime', 'authmethod']
}

export function PersonaDevicesTable (props: {
  disableAddButton?: boolean
  persona?: Persona,
  dpskPoolId?: string
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { persona, dpskPoolId, disableAddButton = false } = props
  const [modelVisible, setModelVisible] = useState(false)
  const [macDevices, setMacDevices] = useState<PersonaDevice[]>([])
  const [dpskDevices, setDpskDevices] = useState<PersonaDevice[]>([])
  const [clientMac, setClientMac] = useState<Set<string>>(new Set())  // including the MAC auth and DPSK devices
  const addClientMac = (mac: string) => setClientMac(prev => new Set(prev.add(mac)))

  const [getClientList] = useLazyGetClientListQuery()
  const { data: dpskDevicesData, ...dpskDevicesResult } = useGetDpskPassphraseDevicesQuery({
    params: {
      tenantId,
      serviceId: dpskPoolId,
      passphraseId: persona?.dpskGuid
    }
  }, { skip: !persona?.dpskGuid || !dpskPoolId })

  // ClientMac format should be: 11:22:33:44:55:66
  const toClientMacFormat = (macAddress: string) => {
    return macAddress.replaceAll('-', ':')
  }

  useEffect(() => {
    if (!persona?.devices) return
    setMacDevices(persona.devices)
    persona.devices.forEach(d => addClientMac(toClientMacFormat(d.macAddress)))
  }, [persona?.devices])

  useEffect(() => {
    if (!dpskDevicesData) return
    const dpskOnlineDevices = toOnlinePersonaDevice(dpskDevicesData)
    setDpskDevices(dpskOnlineDevices)
    dpskOnlineDevices.forEach(d => addClientMac(toClientMacFormat(d.macAddress)))
  }, [dpskDevicesData])

  useEffect(() => {
    if (clientMac.size === 0) return

    getClientList({
      params: { tenantId },
      payload: {
        ...defaultPayload,
        filters: { clientMac: [...clientMac] }
      }
    })
      .then(result => {
        if (!result.data?.data) return
        setMacDevices(aggregateMacAuthDevices(macDevices, result.data.data))
        setDpskDevices(aggregateDpskDevices(dpskDevices, result.data.data))
      })
  }, [clientMac])

  const aggregateDpskDevices = (devices: PersonaDevice[], clientList: ClientList[]) => {
    return devices.map(device => {
      // PersonaMAC format: AB-AB-AB-AB-AB-AB
      // ClientMAC format: ab:ab:ab:ab:ab:ab
      const deviceMac = toClientMacFormat(device.macAddress)
      const client = clientList
        .find(client => client.clientMac.toUpperCase() === deviceMac.toUpperCase())
      // if UE connected
      //  via MAC auth, the authmethod would be: "Standard+Mac"
      //  via DPSK,     the authmethod would be: "Standard+Open"
      const isMacAuth = client?.authmethod?.toUpperCase()?.includes('MAC')

      return client && !isMacAuth
        ? {
          ...device,
          os: client.osType,
          deviceName: client.hostname
        }
        : {
          ...device,
          lastSeenAt: undefined // this device connected via MacAuth not DPSK, do not show lastSeenAt
        }
    }) ?? []
  }

  const aggregateMacAuthDevices = (devices: PersonaDevice[], clientList: ClientList[]) => {
    // Combine client data and persona devices data
    return devices.map(device => {
      // this device does not register to MAC pool successfully.
      if (!device.hasMacRegistered) return device

      // PersonaMAC format: AB-AB-AB-AB-AB-AB
      // ClientMAC format: ab:ab:ab:ab:ab:ab
      const deviceMac = toClientMacFormat(device.macAddress)
      const client = clientList
        .find(client => client.clientMac.toUpperCase() === deviceMac.toUpperCase())
      // if UE connected
      //  via MAC auth, the authmethod would be: "Standard+Mac"
      //  via DPSK,     the authmethod would be: "Standard+Open"
      const isMacAuth = client?.authmethod?.toUpperCase()?.includes('MAC')

      return client && isMacAuth
        ? {
          ...device,
          os: client.osType,
          deviceName: client.hostname,
          lastSeenAt: client.lastUpdateTime
        }
        : device
    }) ?? []
  }

  const toOnlinePersonaDevice = (dpskDevices: DPSKDeviceInfo[]): PersonaDevice[] => {
    return dpskDevices
      .map(device => ({
        personaId: persona?.id ?? '',
        macAddress: device.mac,
        lastSeenAt: moment.utc(device.lastConnected, 'M/D/YYYY, h:mm:ss A').toISOString(),
        hasDpskRegistered: true
      }))
  }

  const [
    addPersonaDevicesMutation,
    { isLoading: isAddPersonaDevicesUpdating }
  ] = useAddPersonaDevicesMutation()
  const [
    deletePersonaDevicesMutation,
    { isLoading: isDeletePersonaDevicesUpdating }
  ] = useDeletePersonaDevicesMutation()

  const deleteDevices = (devices: PersonaDevice[]) => {
    devices.forEach(device => {
      deletePersonaDevicesMutation({
        params: { groupId: persona?.groupId, id: persona?.id, macAddress: device.macAddress }
      }).unwrap()
        .then()
        .catch(error => {
          console.log(error) // eslint-disable-line no-console
        })
    })
  }

  const columns: TableProps<PersonaDevice>['columns'] = [
    {
      key: 'deviceName',
      dataIndex: 'deviceName',
      title: $t({ defaultMessage: 'Device Name' }),
      sorter: { compare: sortProp('deviceName', defaultSort) }
    },
    {
      key: 'os',
      dataIndex: 'os',
      align: 'center',
      title: $t({ defaultMessage: 'OS' }),
      render: (_, { os }) => {
        return <OSIconContainer>
          <Tooltip title={os}>
            { getOsTypeIcon(os as string) }
          </Tooltip>
        </OSIconContainer>
      },
      sorter: { compare: sortProp('os', defaultSort) }
    },
    {
      key: 'macAddress',
      dataIndex: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      sorter: { compare: sortProp('macAddress', defaultSort) },
      render: (_, row) => row.macAddress.replaceAll(':', '-').toUpperCase()
    },
    {
      key: 'hasDpskRegistered',
      dataIndex: 'hasDpskRegistered',
      title: $t({ defaultMessage: 'DPSK' }),
      render: (_, { hasDpskRegistered }) => hasDpskRegistered && <SuccessSolid/>,
      sorter: { compare: sortProp('hasDpskRegistered', defaultSort) }
    },
    {
      key: 'hasMacRegistered',
      dataIndex: 'hasMacRegistered',
      title: $t({ defaultMessage: 'MAC Registration' }),
      align: 'center',
      render: (_, { hasMacRegistered }) => hasMacRegistered && <SuccessSolid/>,
      sorter: { compare: sortProp('hasMacRegistered', defaultSort) }
    },
    {
      key: 'lastSeenAt',
      dataIndex: 'lastSeenAt',
      title: $t({ defaultMessage: 'Last Seen Time' }),
      render: (_, { lastSeenAt }) => {
        return lastSeenAt
          ? moment(lastSeenAt!).format('YYYY/MM/DD HH:mm A')
          : noDataDisplay
      },
      sorter: { compare: sortProp('lastSeenAt', dateSort) }
    }
  ]

  const rowActions: TableProps<PersonaDevice>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {

        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: selectedItems.length > 1 ? 'devices' : '',
            entityValue: selectedItems.length === 1 ? selectedItems[0].macAddress : undefined,
            numOfEntities: selectedItems.length
          },
          // FIXME: Need to add mac registration list id into this dialog
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'It will remove these devices from the MAC Registration list associated with this persona. Are you sure you want to delete them?' }),
          onOk: () => {
            deleteDevices(selectedItems)
            clearSelection()
          }
        })
      }
    }
  ]

  const actions: TableProps<PersonaDevice>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Device' }),
      onClick: () => {setModelVisible(true)},
      disabled: disableAddButton
    }
  ]

  const handleModalCancel = () => {
    setModelVisible(false)
  }

  const handleModalSubmit = (data: Partial<PersonaDeviceItem>[]) => {
    addPersonaDevicesMutation({
      params: { groupId: persona?.groupId, id: persona?.id },
      payload: data
    }).unwrap()
      .then(() => handleModalCancel())
      .catch(error => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  return (
    <Loader
      states={[
        { isLoading: false, isFetching: isAddPersonaDevicesUpdating },
        { isLoading: false, isFetching: isDeletePersonaDevicesUpdating },
        { isLoading: false, isFetching: dpskDevicesResult.isFetching }
      ]}
    >
      <Subtitle level={4}>
        {$t(
          { defaultMessage: 'Devices ({deviceCount})' },
          { deviceCount: dpskDevices.length + macDevices.length }
        )}
      </Subtitle>
      <Table
        rowKey={'macAddress'}
        columns={columns}
        dataSource={macDevices.concat(dpskDevices)}
        rowActions={filterByAccess(rowActions)}
        actions={filterByAccess(actions)}
        rowSelection={hasAccess() ? {
          type: 'checkbox',
          getCheckboxProps: (item) => ({
            // Those devices auth by DPSK can not edit on this page
            disabled: !!item?.hasDpskRegistered
          })
        } : undefined}
        pagination={{ defaultPageSize: 5 }}
      />

      <PersonaDevicesImportDialog
        visible={modelVisible}
        personaGroupId={persona?.groupId}
        selectedMacAddress={persona?.devices?.map(d => d.macAddress.replaceAll('-', ':')) ?? []}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
      />
    </Loader>

  )
}
