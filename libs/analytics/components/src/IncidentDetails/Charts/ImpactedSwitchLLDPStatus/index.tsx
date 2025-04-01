import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { defaultSort, sortProp } from '@acx-ui/analytics/utils'
import {  TableProps,
  showToast,
  Tooltip } from '@acx-ui/components'
import { get }          from '@acx-ui/config'
import { CopyOutlined } from '@acx-ui/icons-new'
import { TenantLink }   from '@acx-ui/react-router-dom'

import { ImpactedSwitchesTable } from '../ImpactedSwitchesTable'
import {
  ImpactedSwitchPortRow
} from '../ImpactedSwitchesTable/services'


import type { ChartProps } from '../types'

export function ImpactedSwitchLLDPTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA')

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = useMemo(()=>[{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' }),
    render: (_, { mac, name },__,highlightFn) =>
      <TenantLink
        to={`devices/switch/${isMLISA ? mac : mac?.toLowerCase()}/serial/details/${isMLISA
          ? 'reports': 'overview'}`
        }>
        {highlightFn(name)}
      </TenantLink>,
    fixed: 'left',
    width: 120,
    sorter: { compare: sortProp('name', defaultSort) },
    defaultSortOrder: 'ascend',
    searchable: true
  }, {
    key: 'serial',
    dataIndex: 'serial',
    title: $t({ defaultMessage: 'Switch Serial' }),
    fixed: 'left',
    width: 80,
    sorter: { compare: sortProp('serial', defaultSort) },
    searchable: true
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' }),
    fixed: 'left',
    width: 90,
    sorter: { compare: sortProp('mac', defaultSort) },
    searchable: true
  }, {
    key: 'reasonCodes',
    dataIndex: 'reasonCodes',
    title: $t({ defaultMessage: 'Impacted Reason' }),
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('reasonCodes', defaultSort) },
    searchable: true
  }, {
    key: 'portNumbers',
    dataIndex: 'portNumbers',
    title: $t({ defaultMessage: 'Port Details' }),
    fixed: 'left',
    width: 240,
    sorter: { compare: sortProp('portNumbers', defaultSort) },
    searchable: true
  }, {
    key: 'action',
    dataIndex: 'action',
    title: $t({ defaultMessage: 'Action' }),
    width: 50,
    render: (_, { portNumbers, portCount }) => {
      return (
        <Tooltip
          title={$t({ defaultMessage: 'Copy Port number{plural} to clipboard.' }
            ,{ plural: portCount > 1 ? 's' : '' })}
          placement='top'>
          <CopyOutlined
            onClick={() => {
              navigator.clipboard.writeText(portNumbers)
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'Port number{plural} copied to clipboard.' },
                  { plural: portCount > 1 ? 's' : '' }
                )
              })
            }}
            size='sm'
            style={{ cursor: 'pointer' }}/>
        </Tooltip>
      )
    }
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[])
  return (
    <ImpactedSwitchesTable
      incident={incident}
      columns={columns}
    />
  )
}
