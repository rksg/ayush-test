import { Key, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer }                      from '@acx-ui/components'
import { SelectConnectedClientsTable } from '@acx-ui/rc/components'
import {
  ClientList
} from '@acx-ui/rc/utils'

export type SimpleClientRecord = Pick<ClientList, 'clientMac' | 'ipAddress'>

export interface SelectConnectedClientsDrawerProps {
  incomingClientsMac?: string[];
  addClients: (clients: SimpleClientRecord[]) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}

export function SelectConnectedClientsDrawer (props: SelectConnectedClientsDrawerProps) {
  const { $t } = useIntl()
  const { incomingClientsMac, addClients, visible, setVisible } = props
  const [ selectedClients, setSelectedClients ] = useState<ClientList[]>([])

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async () => {
    addClients(selectedClients.map(c => ({ clientMac: c.clientMac, ipAddress: c.ipAddress })))

    onClose()
  }

  const onRowChange = (_: Key[], selectedRows: ClientList[]) => {
    setSelectedClients(selectedRows)
  }

  const getCheckboxProps = (row: ClientList) => {
    return {
      disabled: incomingClientsMac?.some(mac => mac.toLowerCase() === row.clientMac.toLowerCase())
    }
  }

  const content = <>
    <p>{ $t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Select the Clients that the Client Isolation Allowlist Policy will be applied to.'
    }) }</p>
    {visible && <SelectConnectedClientsTable
      onRowChange={onRowChange}
      getCheckboxProps={getCheckboxProps}
    />}
  </>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Connected Clients' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
      width={'850px'}
    />
  )
}
