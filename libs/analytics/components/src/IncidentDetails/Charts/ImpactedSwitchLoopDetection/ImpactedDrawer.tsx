import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, Table }    from '@acx-ui/components'
import type { TableColumn } from '@acx-ui/components'
import { get }              from '@acx-ui/config'
import { TenantLink }       from '@acx-ui/react-router-dom'

import { ImpactedVlan, ImpactedSwitch } from './services'

export interface ImpactedDrawerProps {
  vlan: ImpactedVlan
  impactedCount: number
  visible: boolean
  onClose: () => void
}

export const ImpactedSwitchesDrawer: React.FC<ImpactedDrawerProps> = (props) => {
  const { vlan, impactedCount, visible, onClose } = props
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA')
  const columns = useMemo(() => [
    {
      key: 'name',
      dataIndex: 'name',
      width: 150,
      title: $t({ defaultMessage: 'Switch Name' }),
      render: (_, { mac, name, serial },__,highlightFn) =>
        <TenantLink
          to={`devices/switch/${isMLISA ? mac : mac?.toLowerCase()}/${serial}/details/${isMLISA
            ? 'reports': 'overview'}`
          }>
          {highlightFn(name)}
        </TenantLink>,
      searchable: true
    },
    {
      key: 'mac',
      dataIndex: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      searchable: true
    },
    {
      key: 'serial',
      dataIndex: 'serial',
      title: $t({ defaultMessage: 'Serial Number' }),
      width: 120,
      searchable: true
    }
  ] as TableColumn<ImpactedSwitch>[], [$t, isMLISA])

  return <Drawer
    width={470}
    title={$t(
      {
        defaultMessage: '{count} Impacted {count, plural, one {Switch} other {Switches}}',
        description: 'Translation strings - Impacted, Switch, Switches)'
      },
      { count: impactedCount }
    )}
    visible={visible}
    onClose={onClose}
    children={
      <Table<ImpactedSwitch>
        rowKey='mac'
        columns={columns}
        dataSource={vlan?.switches}
        pagination={{ defaultPageSize: 15, pageSize: 15 }}
      />
    }
  />
}