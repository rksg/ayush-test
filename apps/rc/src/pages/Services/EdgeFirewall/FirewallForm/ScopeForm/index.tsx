import { useMemo, useState } from 'react'
import { useEffect }         from 'react'
import { useCallback }       from 'react'

import { Col, Form, Row, Switch, Typography } from 'antd'
import _                                      from 'lodash'
import { useIntl }                            from 'react-intl'

import { StepsForm, TableProps, useStepFormContext } from '@acx-ui/components'
import { formatter }                                 from '@acx-ui/formatter'
import { EdgesTable }                                from '@acx-ui/rc/components'
import { useLazyGetEdgeListQuery }                   from '@acx-ui/rc/services'
import { EdgeStatus }                                from '@acx-ui/rc/utils'
import { useParams }                                 from '@acx-ui/react-router-dom'

import { FirewallFormEdge, FirewallFormModel } from '..'

const FirewallEdgesTable = (props: { data?: string[] }) => {
  const { data: edgeIds } = props
  const { $t } = useIntl()
  const params = useParams()
  const { form } = useStepFormContext<FirewallFormModel>()
  const [selectedEdges, setSelectedEdges] = useState<FirewallFormEdge[]>([])
  const [getEdgeList] = useLazyGetEdgeListQuery()

  const fetchEdgesByIds = useCallback(
    async (edgeIds: string[] | undefined, cb: (edges: FirewallFormEdge[]) => void) => {
      if (!edgeIds || edgeIds.length === 0) return

      try {
        const edgeOptionsDefaultPayload = {
          fields: ['name', 'serialNumber'],
          sortField: 'name',
          filters: { serialNumber: edgeIds },
          sortOrder: 'ASC'
        }

        const { data } = await getEdgeList(
          { params, payload: edgeOptionsDefaultPayload }
        ).unwrap()

        cb(data.map(item =>
          ({ name: item.name, serialNumber: item.serialNumber })))
      } catch {
        cb([] as FirewallFormEdge[])
      }
    }, [params, getEdgeList])

  useEffect(() => {
    fetchEdgesByIds(edgeIds, (edges: FirewallFormEdge[]) => {
      setSelectedEdges(edges)
    })
  }, [edgeIds, fetchEdgesByIds])

  const updateSelectedEdges = (selected: FirewallFormEdge[]) => {
    setSelectedEdges(selected)
    form.setFieldValue('selectedEdges', selected)
  }

  const ActivateSwitch = useMemo(() => ({ row }:{ row: EdgeStatus }) => {
    const activated = _.findIndex(selectedEdges, { serialNumber: row.serialNumber })

    return <Switch
      aria-label={`activate-btn-${row.serialNumber}`}
      checked={activated !== -1}
      onChange={(checked: boolean) => {
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
        updateSelectedEdges(newSelected)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (selectedRows) => {
        let newSelected = _.cloneDeep(selectedEdges)
        _.remove(newSelected,
          (o) => _.findIndex(selectedRows, { serialNumber: o.serialNumber }) !== -1)

        updateSelectedEdges(newSelected)
      }
    }
  ]

  return (
    <EdgesTable
      columns={columns}
      rowSelection={{ type: 'checkbox' }}
      rowActions={rowActions}
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
            name='edgeIds'
            valuePropName='data'
            noStyle
            initialValue={[]}
          >
            <FirewallEdgesTable />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
