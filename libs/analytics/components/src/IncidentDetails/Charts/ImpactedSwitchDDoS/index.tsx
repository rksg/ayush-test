import { useMemo } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { defaultSort, sortProp } from '@acx-ui/analytics/utils'
import {  TableProps,
  showToast,
  Tooltip } from '@acx-ui/components'
import { get }                            from '@acx-ui/config'
import { CopyOutlined, DownloadOutlined } from '@acx-ui/icons-new'
import { TenantLink }                     from '@acx-ui/react-router-dom'
import { handleBlobDownloadFile }         from '@acx-ui/utils'

import { ImpactedSwitchesTable } from '../ImpactedSwitchesTable'
import {
  ImpactedSwitchPortRow
} from '../ImpactedSwitchesTable/services'

import type { ChartProps } from '../types'

export function ImpactedSwitchDDoSTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA')

  const handleExportCSV = (data: ImpactedSwitchPortRow[]) => {
    const csvContent = [
      ['Switch Name', 'Switch MAC', 'Switch Serial', 'Port Numbers'].join(','),
      ...data!.map(row => [
        `"${row.name}"`,
        `"${row.mac}"`,
        `"${row.serial}"`,
        `"${row.portNumbers}"`
      ].join(','))
    ].join('\n')

    const switchText = data.length === 1 ? 'Switch' : 'Switches'
    const timestamp = moment().format('YYYYMMDDHHmmss')
    handleBlobDownloadFile(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
      `TCP-SYN-DDoS-Impacted-${switchText}-${incident.id}-${timestamp}.csv`
    )
  }

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = useMemo(()=>[{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' }),
    render: (_, { mac, name, serial },__,highlightFn) =>
      <TenantLink
        to={`devices/switch/${isMLISA ? mac : mac?.toLowerCase()}/${serial}/details/${isMLISA
          ? 'reports': 'overview'}`
        }>
        {highlightFn(name)}
      </TenantLink>,
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('name', defaultSort) },
    defaultSortOrder: 'ascend',
    searchable: true
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' }),
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('mac', defaultSort) },
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
    key: 'portNumbers',
    dataIndex: 'portNumbers',
    title: $t({ defaultMessage: 'Port Numbers' }),
    fixed: 'left',
    width: 250,
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
      iconButton={{
        icon: <DownloadOutlined />,
        onClick: handleExportCSV,
        tooltip: $t({ defaultMessage: 'Export to CSV' })
      }}
    />
  )
}
