import { useIntl } from 'react-intl'

import { Button }                   from '@acx-ui/components'
import { Table, TableProps }        from '@acx-ui/components'
import { Edit, DeleteOutlinedIcon } from '@acx-ui/icons'

export function LlqpQOSTable ({ data, editable } : {
  data: any,
  editable: boolean
}) {
  const { $t } = useIntl()

  const columns: TableProps<any>['columns'] = [{
    key: 'applicationType',
    title: $t({ defaultMessage: 'Application Type' }),
    dataIndex: 'applicationType',
    defaultSortOrder: 'ascend'
  }, {
    key: 'qosVlanType',
    title: $t({ defaultMessage: 'QoS VLAN Type' }),
    dataIndex: 'qosVlanType'
  }, {
    key: 'vlanId',
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId'
  }, {
    key: 'priority',
    title: $t({ defaultMessage: 'Priority' }),
    dataIndex: 'priority'
  }, {
    key: 'dscp',
    title: $t({ defaultMessage: 'DSCP' }),
    dataIndex: 'dscp'
  }, {
    key: 'action',
    dataIndex: 'id',
    render: (data, row) => {
      return <>
        <Button
          key='delete'
          role='deleteBtn'
          ghost={true}
          disabled={!editable}
          icon={<DeleteOutlinedIcon />}
          style={{ height: '16px' }}
          // onClick={() => handleDelete(row.model)}
        />
        <Button
          key='delete'
          role='deleteBtn'
          ghost={true}
          disabled={!editable}
          icon={<Edit />}
          style={{ height: '16px' }}
          // onClick={() => handleDelete(row.model)}
        />
      </>
    }
  }]

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey='id'
      type='form'
    />
  )
}