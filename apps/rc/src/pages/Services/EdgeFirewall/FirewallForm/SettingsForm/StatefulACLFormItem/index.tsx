import { useState } from 'react'

import { Col, Form, Row, Switch, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { Table, TableProps }         from '@acx-ui/components'
import { ACLDirection, StatefulAcl } from '@acx-ui/rc/utils'
import { filterByAccess }            from '@acx-ui/user'

import { StatefulACLConfigDrawer, getACLDirectionString } from './StatefulACLConfigDrawer'
import { InboundDefaultRules, OutboundDefaultRules }      from './StatefulACLConfigDrawer/defaultRules'

interface StatefulACLTableProps {
  data?: StatefulAcl[]
}

const defaultStatefulACLs = [{
  name: 'Inbound ACL',
  direction: ACLDirection.INBOUND,
  rules: [...InboundDefaultRules]
},{
  name: 'Outbound ACL',
  direction: ACLDirection.OUTBOUND,
  rules: [...OutboundDefaultRules]
}]
const StatefulACLTable = (props: StatefulACLTableProps) => {
  const { data } = props
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
  const [editData, setEditData] = useState<StatefulAcl>({} as StatefulAcl)


  const columns: TableProps<StatefulAcl>['columns'] = [
    {
      title: $t({ defaultMessage: 'ACL Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    },
    {
      title: $t({ defaultMessage: 'Direction' }),
      key: 'direction',
      dataIndex: 'direction',
      render: (_, row) => {
        return getACLDirectionString($t, row.direction)
      }
    },
    {
      title: $t({ defaultMessage: 'Rules' }),
      key: 'rules',
      dataIndex: 'rules',
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
      rowSelection={{ type: 'checkbox' }}
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
  const [tableVisible, setTableVisible] = useState<boolean>(false)


  function onChangeStatefulACL (checked: boolean) {
    setTableVisible(checked)
  }

  return <>
    <Row>
      <Col span={12}>
        <Typography.Text>
          {$t({ defaultMessage: 'Stateful ACL' })}
        </Typography.Text>
      </Col>
      <Col span={6}>
        <Form.Item
          name='statefulACLEnabled'
          valuePropName='checked'
        >
          <Switch
            aria-label='acl'
            onChange={onChangeStatefulACL}
            checkedChildren={$t({ defaultMessage: 'ON' })}
            unCheckedChildren={$t({ defaultMessage: 'OFF' })}
          />
        </Form.Item>
      </Col>
    </Row>

    {tableVisible &&
    <Row>
      <Col span={24}>
        <Form.Item
          name='statefulAcls'
          valuePropName='data'
          initialValue={defaultStatefulACLs}
        >
          <StatefulACLTable />
        </Form.Item>
      </Col>
    </Row>
    }
  </>
}