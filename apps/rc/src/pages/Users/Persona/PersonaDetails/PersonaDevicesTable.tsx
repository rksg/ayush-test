import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { noDataSymbol }                                                    from '@acx-ui/analytics/utils'
import { showActionModal, Table, TableProps, Subtitle, Loader, showToast } from '@acx-ui/components'
import { SuccessSolid }                                                    from '@acx-ui/icons'
import { useAddPersonaDevicesMutation, useDeletePersonaDevicesMutation }   from '@acx-ui/rc/services'
import { Persona, PersonaDevice }                                          from '@acx-ui/rc/utils'

import { PersonaDeviceItem }          from '../PersonaForm/PersonaDevicesForm'
import { PersonaDevicesImportDialog } from '../PersonaForm/PersonaDevicesImportDialog'


export function PersonaDevicesTable (props: {
  persona?: Persona,
  title?: string
}) {
  const { $t } = useIntl()
  const { persona, title } = props
  const [modelVisible, setModelVisible] = useState(false)

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
      title: $t({ defaultMessage: 'OS' })
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

  const handleModalSubmit = (data: Extract<PersonaDeviceItem, ['macAddress', 'hostname']>[]) => {
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
        dataSource={persona?.devices}
        rowActions={rowActions}
        actions={actions}
        rowSelection={{ type: 'checkbox' }}
        pagination={{ defaultPageSize: 5 }}
      />

      <PersonaDevicesImportDialog
        visible={modelVisible}
        personaGroupId={persona?.groupId}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
      />
    </Loader>

  )
}
