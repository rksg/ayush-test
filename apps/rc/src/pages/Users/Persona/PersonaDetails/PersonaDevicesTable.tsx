import { useContext, useEffect, useState } from 'react'

import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableProps, Tooltip } from '@acx-ui/components'
import { SuccessSolid }                                                   from '@acx-ui/icons'
import {
  OSIconContainer,
  PersonaDeviceItem,
  PersonaDevicesImportDialog
} from '@acx-ui/rc/components'
import {
  useAddPersonaDevicesMutation,
  useDeletePersonaDevicesMutation,
  useGetDpskPassphraseDevicesQuery,
  useLazyGetClientsQuery
} from '@acx-ui/rc/services'
import {
  ClientInfo,
  dateSort,
  defaultSort,
  DPSKDeviceInfo,
  getOsTypeIcon,
  Persona,
  PersonaDevice,
  PersonaErrorResponse, PersonaUrls,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasCrossVenuesPermission } from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                 from '@acx-ui/utils'

import { IdentityDeviceContext } from './index'


const defaultClientPayload = {
  searchString: '',
  searchTargetFields: ['macAddress', 'ipAddress', 'username', 'hostname', 'osType'],
  fields: ['macAddress','ipAddress','username', 'hostname','osType',
    'venueInformation.name', 'apInformation.name',
    'lastUpdatedTime', 'networkInformation.authenticationMethod'],
  page: 1,
  pageSize: 10000
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

  const { setDeviceCount } = useContext(IdentityDeviceContext)
  const [getClientList] = useLazyGetClientsQuery()

  const { data: dpskDevicesData, ...dpskDevicesResult } = useGetDpskPassphraseDevicesQuery({
    params: {
      tenantId,
      serviceId: dpskPoolId,
      passphraseId: persona?.dpskGuid
    }
  }, { skip: !persona?.dpskGuid || !dpskPoolId })

  // ClientMac format should be: 11:22:33:44:55:66
  const toClientMacFormat = (macAddress: string) => {
    return macAddress.replaceAll('-', ':').toUpperCase()
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

    setDeviceCount(dpskDevices.length + macDevices.length)

    getClientList({
      params: { tenantId },
      payload: {
        ...defaultClientPayload,
        filters: { macAddress: [...clientMac] }
      }
    })
      .then(result => {
        if (!result.data?.data) return
        setMacDevices(aggregateMacAuthDevices(macDevices, result.data.data))
        setDpskDevices(aggregateDpskDevices(dpskDevices, result.data.data))
      })
  }, [clientMac])

  const aggregateDpskDevices = (devices: PersonaDevice[], clientList: ClientInfo[]) => {
    return devices.map(device => {
      // PersonaMAC format: AB-AB-AB-AB-AB-AB
      // ClientMAC format: ab:ab:ab:ab:ab:ab
      const deviceMac = toClientMacFormat(device.macAddress)
      const client = clientList
        .find(client => client.macAddress.toUpperCase() === deviceMac.toUpperCase())
      // if UE connected
      //  via MAC auth, the authmethod would be: "Standard+Mac"
      //  via DPSK,     the authmethod would be: "Standard+Open"
      const authmethod = client?.networkInformation?.authenticationMethod
      const isMacAuth = authmethod?.toUpperCase()?.includes('MAC')

      return client && !isMacAuth && device.online
        ? {
          ...device,
          os: client.osType,
          deviceName: client.hostname,
          lastSeenAt: client.lastUpdatedTime
        }
        : {
          ...device,
          lastSeenAt: undefined // this device connected via MacAuth not DPSK, do not show lastSeenAt
        }
    }) ?? []
  }

  const aggregateMacAuthDevices = (devices: PersonaDevice[], clientList: ClientInfo[]) => {
    // Combine client data and persona devices data
    return devices.map(device => {
      // this device does not register to MAC pool successfully.
      if (!device.hasMacRegistered) return device

      // PersonaMAC format: AB-AB-AB-AB-AB-AB
      // ClientMAC format: ab:ab:ab:ab:ab:ab
      const deviceMac = toClientMacFormat(device.macAddress)
      const client = clientList
        .find(client => client.macAddress.toUpperCase() === deviceMac.toUpperCase())
      // if UE connected
      //  via MAC auth, the authmethod would be: "Standard+Mac"
      //  via DPSK,     the authmethod would be: "Standard+Open"
      const authmethod = client?.networkInformation?.authenticationMethod
      const isMacAuth = authmethod?.toUpperCase()?.includes('MAC')

      return client && isMacAuth
        ? {
          ...device,
          os: client.osType,
          deviceName: client.hostname,
          lastSeenAt: client.lastUpdatedTime
        }
        : device
    }) ?? []
  }

  const toOnlinePersonaDevice = (dpskDevices: DPSKDeviceInfo[]): PersonaDevice[] => {
    // Show all dpsk devices, but only connected devices show lastSeenAt.
    return dpskDevices
      .map(device => ({
        personaId: persona?.id ?? '',
        macAddress: device.mac,
        online: device.deviceConnectivity === 'CONNECTED',
        lastSeenAt: device.deviceConnectivity === 'CONNECTED'
          ? device.lastConnectedTime ?? undefined
          : undefined,
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
      align: 'center',
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

  const rowActions: TableProps<PersonaDevice>['rowActions'] =
    hasCrossVenuesPermission({ needGlobalPermission: true })
      ? [
        {
          label: $t({ defaultMessage: 'Delete' }),
          rbacOpsIds: [getOpsApi(PersonaUrls.deletePersonaDevices)],
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
              content: $t({ defaultMessage: 'It will remove these devices from the MAC Registration list associated with this identity. Are you sure you want to delete them?' }),
              onOk: () => {
                deleteDevices(selectedItems)
                clearSelection()
              }
            })
          }
        }
      ] : []

  const actions: TableProps<PersonaDevice>['actions'] =
    hasCrossVenuesPermission({ needGlobalPermission: true })
      ? [{
        label: $t({ defaultMessage: 'Add Device' }),
        rbacOpsIds: [getOpsApi(PersonaUrls.addPersonaDevices)],
        onClick: () => {
          setModelVisible(true)
        },
        disabled: disableAddButton
      }] : []

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
        handleAddDevicesError(error)
      })
  }

  const handleAddDevicesError = (error: PersonaErrorResponse) => {
    if (error.status && error.status === 400) {
      const subError = error.data.subErrors && error.data.subErrors.at(0)?.message

      showToast({
        type: 'error',
        content: undefined,
        extraContent: (error.data.message
            ?? error.data.debugMessage
            ?? $t({ defaultMessage: 'An error occurred' })
        ) + (subError ? (' - ' + subError) : '')
      })
    } else {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Error' }),
        content: $t({
          defaultMessage: 'The following information was reported for the error you encountered.'
        }),
        customContent: {
          action: 'SHOW_ERRORS',
          errorDetails: error
        }
      })
    }
  }

  return (
    <Loader
      states={[
        { isLoading: false, isFetching: isAddPersonaDevicesUpdating },
        { isLoading: false, isFetching: isDeletePersonaDevicesUpdating },
        { isLoading: false, isFetching: dpskDevicesResult.isFetching }
      ]}
    >
      <Table
        rowKey={'macAddress'}
        columns={columns}
        dataSource={macDevices.concat(dpskDevices)}
        rowActions={filterByAccess(rowActions)}
        actions={filterByAccess(actions)}
        rowSelection={filterByAccess(rowActions).length !== 0 ? {
          type: 'checkbox',
          getCheckboxProps: (item) => ({
            // Those devices auth by DPSK can not edit on this page
            disabled: !!item?.hasDpskRegistered
          })
        } : undefined}
        pagination={{ defaultPageSize: 5 }}
      />

      {modelVisible &&
        <PersonaDevicesImportDialog
          visible={true}
          personaGroupId={persona?.groupId}
          selectedMacAddress={persona?.devices?.map(d => d.macAddress.replaceAll('-', ':')) ?? []}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
        />
      }
    </Loader>

  )
}
