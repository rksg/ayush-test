import { useMemo } from 'react'

import { Col, Form, Row, Switch, Typography } from 'antd'
import _                                      from 'lodash'
import { useIntl }                            from 'react-intl'

import { StepsForm, TableProps, useStepFormContext } from '@acx-ui/components'
import { formatter }                                 from '@acx-ui/formatter'
import { EdgesTable }                                from '@acx-ui/rc/components'
import { EdgeStatus }                                from '@acx-ui/rc/utils'

import { FirewallForm } from '..'

export const ScopeForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<FirewallForm>()
  const selectedEdges: {
     serialNumber: string;
     name: string; }[] = Form.useWatch('selectedEdges', form)

  const ActivateSwitch = useMemo(() => ({ row }:{ row: EdgeStatus }) => {
    const activated = _.findIndex(selectedEdges, { serialNumber: row.serialNumber })

    return <Switch
      aria-label={`activate-btn-${row.serialNumber}`}
      checked={activated !== -1}
      onChange={(checked: boolean) => {
        let newSelected = _[checked ? 'unionBy' : 'xorBy'](selectedEdges,
          [_.pick(row, ['serialNumber', 'name'])], 'serialNumber')
        form.setFieldValue('selectedEdges', newSelected)
      }}
      checkedChildren={$t({ defaultMessage: 'ON' })}
      unCheckedChildren={$t({ defaultMessage: 'OFF' })}
    />
  }, [$t, form, selectedEdges])

  const columns: TableProps<EdgeStatus>['columns'] = useMemo(() => ([
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      tooltip: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venue',
      dataIndex: ['venueName']
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'mac',
      dataIndex: 'mac'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      key: 'clients',
      dataIndex: 'clients'
    },
    {
      title: $t({ defaultMessage: 'Up Time' }),
      key: 'upTime',
      dataIndex: 'upTime',
      render: (data) => {
        return formatter('longDurationFormat')(data)
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      key: 'action',
      dataIndex: 'action',
      render: (data, row) => {
        return <ActivateSwitch row={row}/>
      }
    }
  ]), [$t, ActivateSwitch])

  const rowActions: TableProps<EdgeStatus>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (selectedRows) => {
        let newSelected = _.unionBy(selectedEdges, selectedRows, 'serialNumber')
        form.setFieldValue('selectedEdges', newSelected)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (selectedRows) => {
        let newSelected = _.xorBy(selectedEdges, selectedRows, 'serialNumber')
        form.setFieldValue('selectedEdges', newSelected)
      }
    }
  ]

  return (
    <>
      <Row>
        <Col span={8}>
          <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
        </Col>
      </Row>
      <Row >
        <Col span={8}>
          <Typography.Text>
            {$t({ defaultMessage: 'Select the SmartEdges to run the Firewall Service on:' })}
          </Typography.Text>
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <Form.Item
            name='selectedEdges'
            noStyle
            initialValue={[]}
          >
            <EdgesTable
              rowActions={rowActions}
              columns={columns}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
