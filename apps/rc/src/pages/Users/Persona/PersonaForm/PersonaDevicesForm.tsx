import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import {  Table, TableProps }                   from '@acx-ui/components'
import { defaultSort, PersonaDevice, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }            from '@acx-ui/user'

import { PersonaDevicesImportDialog } from './PersonaDevicesImportDialog'


export interface PersonaDeviceItem extends PersonaDevice {
  hostname?: string
}

interface PersonaDevicesFormProps {
  groupId?: string,
  canAddDevices?: boolean,
  value?: PersonaDeviceItem[],
  onChange?: (value: Partial<PersonaDeviceItem>[]) => void
}

export function PersonaDevicesForm (props: PersonaDevicesFormProps) {
  const { $t } = useIntl()
  const { canAddDevices, value, onChange } = props
  const [modelVisible, setModelVisible] = useState(false)

  const triggerOnChange = (changeValue: Partial<PersonaDeviceItem>[]) => {
    onChange?.(changeValue ?? [])
  }

  const handleModalCancel = () => {
    setModelVisible(false)
  }

  const handleModalSubmit = (data: Partial<PersonaDeviceItem>[]) => {
    triggerOnChange([ ...value ?? [], ...data ])
    setModelVisible(false)
  }

  const columns = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      sorter: { compare: sortProp('macAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      key: 'hostname',
      sorter: { compare: sortProp('hostname', defaultSort) }
    }
  ]

  const actions: TableProps<PersonaDeviceItem>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Device' }),
      disabled: !canAddDevices,
      onClick: () => {
        setModelVisible(true)
      }
    }
  ]

  const rowActions: TableProps<PersonaDeviceItem>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {
        const selectedMacs = selectedItems.map(i => i.macAddress)
        triggerOnChange(value?.filter(item => !selectedMacs.includes(item.macAddress)) ?? [])
        clearSelection()
      }
    }
  ]

  return (
    <>
      <Table
        type={'form'}
        rowKey='macAddress'
        columns={columns}
        dataSource={value ?? []}
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { defaultSelectedRowKeys: [] }}
      />
      <PersonaDevicesImportDialog
        visible={modelVisible}
        personaGroupId={props.groupId}
        selectedMacAddress={value?.map(v => v.macAddress.replaceAll('-', ':')) ?? []}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
      />
    </>
  )
}
