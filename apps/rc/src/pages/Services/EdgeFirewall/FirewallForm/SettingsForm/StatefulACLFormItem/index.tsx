import { useState } from 'react'

import { Col, Form, Row, Switch, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { Table, TableProps }                                from '@acx-ui/components'
import { ACLDirection, getACLDirectionString, StatefulAcl } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                        from '@acx-ui/user'

import { StatefulACLConfigDrawer }                   from './StatefulACLConfigDrawer'
import { InboundDefaultRules, OutboundDefaultRules } from './StatefulACLConfigDrawer/defaultRules'

export const defaultInboundStatefulACLs = {
  name: 'Inbound ACL',
  direction: ACLDirection.INBOUND,
  rules: [...InboundDefaultRules]
}
export const defaultOutboundStatefulACLs = {
  name: 'Outbound ACL',
  direction: ACLDirection.OUTBOUND,
  rules: [...OutboundDefaultRules]
}
export const defaultStatefulACLs = [
  { ...defaultInboundStatefulACLs },
  { ...defaultOutboundStatefulACLs }
]

interface StatefulACLTableProps {
  data?: StatefulAcl[]
}
const StatefulACLTable = (props: StatefulACLTableProps) => {
  const { data } = props
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
  const [editData, setEditData] = useState<StatefulAcl>({} as StatefulAcl)

  const columns: TableProps<StatefulAcl>['columns'] = [
    {
      title: $t({ defaultMessage: 'ACL Name' }),
      key: 'name',
      dataIndex: 'name',
      width: 300
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      width: 400
    },
    {
      title: $t({ defaultMessage: 'Direction' }),
      key: 'direction',
      dataIndex: 'direction',
      width: 100,
      render: (_, row) => {
        return getACLDirectionString($t, row.direction)
      }
    },
    {
      title: $t({ defaultMessage: 'Rules' }),
      key: 'rules',
      dataIndex: 'rules',
      width: 100,
      render: (_, row) => {
        return row.rules.length
      }
    }
  ]

  const rowActions: TableProps<StatefulAcl>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setEditData(selectedRows[0])
        setDrawerVisible(true)
      }
    }
  ]

  return <>
    <Table
      columns={columns}
      dataSource={data}
      rowKey='direction'
      rowActions={filterByAccess(rowActions)}
      rowSelection={hasAccess() && { type: 'radio' }}
    />
    <StatefulACLConfigDrawer
      visible={drawerVisible}
      setVisible={setDrawerVisible}
      editData={editData}
    />
  </>
}

export const StatefulACLFormItem = () => {
  const { $t } = useIntl()

  return <>
    <Row>
      <Col span={6}>
        <Typography.Text>
          {$t({ defaultMessage: 'Stateful ACL' })}
        </Typography.Text>
      </Col>
      <Col span={6}>
        <Form.Item
          name='statefulAclEnabled'
          valuePropName='checked'
          initialValue={false}
          noStyle
        >
          <Switch
            aria-label='acl'
            checkedChildren={$t({ defaultMessage: 'ON' })}
            unCheckedChildren={$t({ defaultMessage: 'OFF' })}
          />
        </Form.Item>
      </Col>
    </Row>

    <Row>
      <Col span={24}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            return prevValues.statefulAclEnabled !== currentValues.statefulAclEnabled
          }}
        >
          {({ getFieldValue }) => {
            const isEnabled = getFieldValue('statefulAclEnabled')
            return isEnabled && <Form.Item
              name='statefulAcls'
              valuePropName='data'
              initialValue={defaultStatefulACLs}
              noStyle
            >
              <StatefulACLTable />
            </Form.Item>
          }}
        </Form.Item>
      </Col>
    </Row>
  </>
}