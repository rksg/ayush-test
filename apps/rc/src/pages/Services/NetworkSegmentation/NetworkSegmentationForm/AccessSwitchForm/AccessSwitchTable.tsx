import React from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps, useStepFormContext
} from '@acx-ui/components'
import { SimpleListTooltip }           from '@acx-ui/rc/components'
import { useWebAuthTemplateListQuery } from '@acx-ui/rc/services'
import { AccessSwitch }                from '@acx-ui/rc/utils'
import { useParams }                   from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupForm } from '..'
import { useWatch }                     from '../../useWatch'


export function AccessSwitchTable (props: {
  rowSelection?: TableProps<AccessSwitch>['rowSelection'];
  rowActions?: TableProps<AccessSwitch>['rowActions'];
  type?: TableProps<AccessSwitch>['type'];
  dataSource: AccessSwitch[];
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()


  const distributionSwitchInfos = useWatch('distributionSwitchInfos', form)

  const { data: templateListResult } = useWebAuthTemplateListQuery({
    params: { tenantId },
    payload: {
      fields: ['name', 'id']
    }
  })

  const columns: TableProps<AccessSwitch>['columns'] = [{
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
      return distributionSwitchInfos?.find(ds => ds.id === dsId)?.name || dsId
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
      } else {
        displayText = templateListResult?.data.find(tp => tp.id === row.templateId)?.name ||
          $t({ defaultMessage: 'template' })
      }
      const items = [
        `${$t({ defaultMessage: 'Header' })}: ${row['webAuthCustomTop'] || ''}`,
        `${$t({ defaultMessage: 'Title' })}: ${row['webAuthCustomTitle'] || ''}`,
        `${$t({ defaultMessage: 'Password Label' })}: ${row['webAuthPasswordLabel'] || ''}`,
        `${$t({ defaultMessage: 'Button Text' })}: ${row['webAuthCustomLoginButton'] || ''}`,
        `${$t({ defaultMessage: 'Footer' })}: ${row['webAuthCustomBottom'] || ''}`
      ]
      return <SimpleListTooltip displayText={displayText} items={items}/>
    }
  }]

  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
