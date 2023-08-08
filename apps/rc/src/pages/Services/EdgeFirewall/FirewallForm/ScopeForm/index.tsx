import { useMemo } from 'react'

import { Col, Form, Row, Switch, Typography } from 'antd'
import _                                      from 'lodash'
import { useIntl }                            from 'react-intl'

import { StepsForm, TableProps, useStepFormContext } from '@acx-ui/components'
import { formatter }                                 from '@acx-ui/formatter'
import { EdgesTable }                                from '@acx-ui/rc/components'
import { EdgeStatus }                                from '@acx-ui/rc/utils'

import { FirewallFormEdge, FirewallFormModel } from '..'

import { StyledFWInfoText } from './styledComponents'

const FirewallEdgesTable = (props: { data?: FirewallFormEdge[] }) => {
  const { data: selectedEdges = [] } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext<FirewallFormModel>()

  const updateSelectedEdges = (selected: FirewallFormEdge[]) => {
    form.setFieldValue('selectedEdges', selected)
  }

  const ActivateSwitch = useMemo(() => ({ row }:{ row: EdgeStatus }) => {
    const activated = _.findIndex(selectedEdges, { serialNumber: row.serialNumber })

    return <Switch
      aria-label={`activate-btn-${row.serialNumber}`}
      checked={activated !== -1}
      onChange={(checked: boolean, e: React.MouseEvent<HTMLButtonElement>) => {
        // prevent checkbox change
        e.stopPropagation()

        let newSelected
        if (checked) {
          newSelected = _.unionBy(selectedEdges,
            [_.pick(row, ['serialNumber', 'name'])], 'serialNumber')
        } else {
          newSelected = [...selectedEdges]
          _.remove(newSelected,
            _.pick(row, ['serialNumber', 'name']))
        }

        updateSelectedEdges(newSelected)
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
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venue',
      dataIndex: 'venueName'
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'mac',
      dataIndex: 'mac',
      width: 120
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      key: 'clients',
      dataIndex: 'clients',
      align: 'center',
      width: 80
    },
    {
      title: $t({ defaultMessage: 'Up Time' }),
      key: 'upTime',
      dataIndex: 'upTime',
      align: 'center',
      width: 100,
      render: (_, { upTime }) => {
        return formatter('longDurationFormat')(upTime ?? 0)
      }
    },
    {
      title: $t({ defaultMessage: 'Firewall Server' }),
      key: 'firewall',
      dataIndex: 'firewallId',
      align: 'center',
      render: (_, row) => {
        const fwId = row.firewallId
        return fwId
          ?<StyledFWInfoText>
            {$t({ defaultMessage: 'ON{br}({serviceNameLink})' },
              {
                br: <br/>,
                serviceNameLink: <Typography.Text>
                  {row.firewallName}
                </Typography.Text>
              })}
          </StyledFWInfoText>
          : $t({ defaultMessage: 'OFF' })
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      width: 80,
      render: (_, row) => {
        return <ActivateSwitch row={row}/>
      }
    }
  ]), [$t, ActivateSwitch])

  const rowActions: TableProps<EdgeStatus>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (selectedRows, clearSelection) => {
        let newSelected = _.unionBy(selectedEdges, selectedRows, 'serialNumber')
        newSelected = newSelected.map(item =>
          ({ name: item.name, serialNumber: item.serialNumber }))
        updateSelectedEdges(newSelected)
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (selectedRows, clearSelection) => {
        let newSelected = _.cloneDeep(selectedEdges)
        _.remove(newSelected,
          (o) => _.findIndex(selectedRows, { serialNumber: o.serialNumber }) !== -1)
        updateSelectedEdges(newSelected)
        clearSelection()
      }
    }
  ]

  const edgeOptionsDefaultPayload = {
    fields: [
      'name',
      'serialNumber',
      'venueName',
      'mac',
      'ip',
      'clients',
      'upTime',
      'firewallId',
      'firewallName'
    ],
    sortField: 'name',
    sortOrder: 'ASC'
  }

  return (
    <EdgesTable
      settingsId='edgefirewall-edge-table'
      columns={columns}
      rowSelection={{ type: 'checkbox' }}
      rowActions={rowActions}
      tableQuery={{ defaultPayload: edgeOptionsDefaultPayload }}
    />
  )}

export const ScopeForm = () => {
  const { $t } = useIntl()

  return (
    <>
      <Row>
        <Col span={24}>
          <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <Typography.Text>
            {$t({ defaultMessage: 'Select the SmartEdges to run the Firewall Service on:' })}
          </Typography.Text>
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <Form.Item
            name='selectedEdges'
            valuePropName='data'
            noStyle
          >
            <FirewallEdgesTable />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
