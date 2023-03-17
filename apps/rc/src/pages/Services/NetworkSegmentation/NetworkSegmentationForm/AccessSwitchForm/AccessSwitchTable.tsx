import React from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps, useStepFormContext
} from '@acx-ui/components'
import { SimpleListTooltip }                from '@acx-ui/rc/components'
import { useWebAuthTemplateListQuery }      from '@acx-ui/rc/services'
import { AccessSwitch, DistributionSwitch } from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupForm } from '..'
import { defaultTemplateData }          from '../../../NetworkSegWebAuth/NetworkSegAuthForm'


interface AccessSwitchesTableProps extends Omit<TableProps<AccessSwitch>, 'columns'> {
  distributionSwitchInfos?: DistributionSwitch[]
}

export function AccessSwitchTable (props: AccessSwitchesTableProps) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()

  const dsList: DistributionSwitch[] = form ?
    form.getFieldValue('distributionSwitchInfos') : props.distributionSwitchInfos

  const { data: templateListResult } = useWebAuthTemplateListQuery({
    params: { tenantId },
    payload: { fields: ['name', 'id'] }
  })

  const columns: TableProps<AccessSwitch>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'name',
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
      render: (data, row) => {
        const dsId = row.distributionSwitchId
        return dsList?.find(ds => ds.id === dsId)?.name || dsId
      }
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
  }, [$t, dsList, templateListResult])

  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
