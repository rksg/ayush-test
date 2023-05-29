import React from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { useWebAuthTemplateListQuery }       from '@acx-ui/rc/services'
import { AccessSwitch, defaultTemplateData } from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'

import { SimpleListTooltip } from '../SimpleListTooltip'

export interface AccessSwitchTableDataType extends AccessSwitch {
  distributionSwitchName: string
}

interface AccessSwitchesTableProps extends Omit<TableProps<AccessSwitchTableDataType>, 'columns'> {}

export function AccessSwitchTable (props: AccessSwitchesTableProps) {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const { data: templateListResult } = useWebAuthTemplateListQuery({
    params: { tenantId },
    payload: { fields: ['name', 'id'] }
  })

  const columns: TableProps<AccessSwitchTableDataType>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'name',
      fixed: 'left',
      sorter: true
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    }, {
      key: 'distributionSwitchId',
      title: $t({ defaultMessage: 'Dist. Switch' }),
      dataIndex: 'distributionSwitchId',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => (row.distributionSwitchName)
    }, {
      key: 'uplinkInfo',
      title: $t({ defaultMessage: 'Uplink Port' }),
      dataIndex: ['uplinkInfo', 'uplinkId'],
      sorter: true,
      render: (data, row) => {
        return row.uplinkInfo ? `${row.uplinkInfo.uplinkType} ${data}` : ''
      }
    }, {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN ID' }),
      dataIndex: 'vlanId',
      sorter: true
    }, {
      key: 'templateId',
      title: $t({ defaultMessage: 'Net Seg Auth Page' }),
      dataIndex: 'templateId',
      sorter: true,
      render: (data, row) => {
        let displayText = ''
        if (row.webAuthPageType === 'USER_DEFINED') {
          displayText = $t({ defaultMessage: 'custom' })
        } else if (row.webAuthPageType === 'TEMPLATE') {
          displayText = templateListResult?.data.find(tp => tp.id === row.templateId)?.name ||
            $t({ defaultMessage: 'template' })
        }
        const items = (Object.keys(defaultTemplateData) as (keyof typeof defaultTemplateData)[])
          .map(name=>row[name] ? `${$t(defaultTemplateData[name].label)}: ${row[name]}` : '')
          .filter(s=>!!s)
        return <SimpleListTooltip displayText={displayText} items={items}/>
      }
    }]
  }, [$t, templateListResult])

  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
