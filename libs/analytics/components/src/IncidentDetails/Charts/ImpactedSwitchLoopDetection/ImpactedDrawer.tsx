import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { formattedPath }          from '@acx-ui/analytics/utils'
import { Drawer, Table, Tooltip } from '@acx-ui/components'
import type { TableColumn }       from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { TenantLink }             from '@acx-ui/react-router-dom'
import { NetworkPath }            from '@acx-ui/utils'

import { ImpactedVlan, ImpactedSwitch } from './services'

export interface ImpactedDrawerProps {
  vlan: ImpactedVlan
  impactedCount: number
  visible: boolean
  sliceType: string
  path: NetworkPath
  onClose: () => void
}

export const ImpactedSwitchesDrawer: React.FC<ImpactedDrawerProps> = (props) => {
  const { vlan, impactedCount, visible, sliceType, path, onClose } = props
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA')
  const shouldIncludeSwitchGroup = ['system','domain'].includes(sliceType)
  const columns = useMemo(() => {
    const tableColumns = [
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
    ] as TableColumn<ImpactedSwitch>[]

    if (shouldIncludeSwitchGroup) {
      tableColumns.push(
        {
          key: 'switchGroup',
          dataIndex: 'switchGroup',
          title: $t({ defaultMessage: 'Switch Group' }),
          width: 120,
          searchable: true,
          render: (_, { switchGroup, domains }, __, highlightFn ) => {
            const basePath = [...path]
            if (basePath.length === 1 && domains.length > 0) {
              domains.forEach((domain) => {
                const domainName = domain.split('||')[1]
                basePath.push({ type: 'domain', name: domainName })
              })
            }
            basePath.push({ type: 'switchGroup', name: switchGroup })
            return <Tooltip
              placement='top'
              title={formattedPath(basePath, switchGroup)}
              dottedUnderline={true}
            >
              {highlightFn(switchGroup)}
            </Tooltip>
          }
        }
      )
    }
    return tableColumns
  }, [$t, isMLISA, path, shouldIncludeSwitchGroup])
  const drawerWidth = shouldIncludeSwitchGroup ? 590 : 470

  return <Drawer
    width={drawerWidth}
    title={$t(
      {
        // eslint-disable-next-line max-len
        defaultMessage: '{count} Impacted {count, plural, one {Switch} other {Switches}} in VLAN ID: {vlanId}',
        description: 'Translation strings - Impacted, Switch, Switches)'
      },
      {
        count: impactedCount,
        vlanId: vlan.vlanId
      }
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