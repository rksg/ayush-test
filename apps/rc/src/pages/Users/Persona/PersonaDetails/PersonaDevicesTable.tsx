import { useEffect, useState } from 'react'

import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { noDataSymbol }                                                             from '@acx-ui/analytics/utils'
import { Loader, showActionModal, showToast, Subtitle, Table, TableProps, Tooltip } from '@acx-ui/components'
import { SuccessSolid }                                                             from '@acx-ui/icons'
import { OSIconContainer }                                                          from '@acx-ui/rc/components'
import {
  useAddPersonaDevicesMutation,
  useDeletePersonaDevicesMutation,
  useLazyGetClientListQuery
} from '@acx-ui/rc/services'
import { ClientList, getOsTypeIcon, Persona, PersonaDevice } from '@acx-ui/rc/utils'
import { hasAccesses }                                       from '@acx-ui/user'

import { PersonaDeviceItem }          from '../PersonaForm/PersonaDevicesForm'
import { PersonaDevicesImportDialog } from '../PersonaForm/PersonaDevicesImportDialog'

const defaultPayload = {
  searchString: '',
  searchTargetFields: ['clientMac', 'ipAddress', 'Username', 'hostname', 'osType'],
  fields: ['hostname','osType','clientMac','ipAddress','Username', 'venueName', 'apName']
}

export function PersonaDevicesTable (props: {
  persona?: Persona,
  title?: string
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { persona, title } = props
  const [modelVisible, setModelVisible] = useState(false)
  const [dataSource, setDataSource] = useState<PersonaDevice[]>(persona?.devices ?? [])

  const [getClientList] = useLazyGetClientListQuery()

  useEffect(() => {
    if (!persona?.devices) return

    getClientList({
      params: { tenantId },
      payload: {
        ...defaultPayload,
        ...persona.devices
          ? { filters: { clientMac: persona.devices.map(d => d.macAddress.replaceAll('-', ':')) } }
          : {}
      }
    })
      .then(result => {
        if (!result.data?.data) return
        setDataSource(aggregatePersonaDevices(result.data.data))
      })
  }, [persona?.devices])

  const aggregatePersonaDevices = (clientList: ClientList[]) => {
    // Combine client data and persona devices data
    return persona?.devices?.map(device => {
      // PersonaMAC format: AB-AB-AB-AB-AB-AB
      // ClientMAC format: ab:ab:ab:ab:ab:ab
      const deviceMac = device.macAddress.replaceAll('-', ':')
      const client = clientList
        .find(client => client.clientMac.toUpperCase() === deviceMac.toUpperCase())

      return client
        ? { ...device, os: client.osType, deviceName: client.hostname }
        : device
    }) ?? []
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
          showToast({
            type: 'error',
            content: $t({ defaultMessage: 'An error occurred' }),
            // FIXME: Correct the error message
            link: { onClick: () => alert(JSON.stringify(error)) }
          })
        })
    })
  }

  const columns: TableProps<PersonaDevice>['columns'] = [
    {
      key: 'deviceName',
      dataIndex: 'deviceName',
      title: $t({ defaultMessage: 'Device Name' })
    },
    {
      key: 'os',
      dataIndex: 'os',
      align: 'center',
      title: $t({ defaultMessage: 'OS' }),
      render: (data) => {
        return <OSIconContainer>
          <Tooltip title={data}>
            { getOsTypeIcon(data as string) }
          </Tooltip>
        </OSIconContainer>
      }
    },
    {
      key: 'macAddress',
      dataIndex: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' })
    },
    {
      key: 'dpsk',
      dataIndex: 'dpsk',
      title: $t({ defaultMessage: 'DPSK' })
    },
    {
      key: 'hasMacRegistered',
      dataIndex: 'hasMacRegistered',
      title: $t({ defaultMessage: 'MAC Registration' }),
      align: 'center',
      render: (data) => { return data ? <SuccessSolid/> : ''}
    },
    {
      key: 'lastSeenAt',
      dataIndex: 'lastSeenAt',
      title: $t({ defaultMessage: 'Last Seen Time' }),
      render: (data) => {
        return data
          ? moment(data as string).format('YYYY/MM/DD HH:MM A')
          : noDataSymbol
      }
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
      onClick: () => {setModelVisible(true)}
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
      .then()
      .catch(error => {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'An error occurred' }),
          // FIXME: Correct the error message
          link: { onClick: () => alert(JSON.stringify(error)) }
        })
      })
  }

  return (
    <Loader
      states={[
        { isLoading: false, isFetching: isAddPersonaDevicesUpdating },
        { isLoading: false, isFetching: isDeletePersonaDevicesUpdating }
      ]}
    >
      <Subtitle level={4}>{title}</Subtitle>
      <Table
        rowKey={'macAddress'}
        columns={columns}
        dataSource={dataSource}
        rowActions={hasAccesses(rowActions)}
        actions={hasAccesses(actions)}
        rowSelection={{ type: 'checkbox' }}
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
