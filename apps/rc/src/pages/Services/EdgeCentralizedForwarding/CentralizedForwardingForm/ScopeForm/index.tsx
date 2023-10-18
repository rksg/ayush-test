import { useMemo } from 'react'

import { Col, Form, Row, Switch, Typography } from 'antd'
import _                                      from 'lodash'
import { useIntl }                            from 'react-intl'

import { StepsForm, Table, TableProps, useStepFormContext }                from '@acx-ui/components'
import { useVenueNetworkActivationsDataListQuery }                         from '@acx-ui/rc/services'
import { EdgeCentralizedForwardingSetting, NetworkSaveData, networkTypes } from '@acx-ui/rc/utils'
import { useParams }                                                       from '@acx-ui/react-router-dom'

export type ActivatedNetwork = Pick<NetworkSaveData, 'id' | 'name'>

interface ActivatedNetworksTableProps {
  venueId: string,
  data?: ActivatedNetwork[],
}

const ActivatedNetworksTable = (props: ActivatedNetworksTableProps) => {
  const { data: activated, venueId } = props
  const params = useParams()
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeCentralizedForwardingSetting>()

  const { networkList } = useVenueNetworkActivationsDataListQuery({
    params: { ...params },
    payload: {
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      venueId: venueId,
      fields: [
        'id',
        'name',
        'type'
      ]
    }
  }, {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => {
      return {
        networkList: data,
        isLoading
      }
    }
  })

  const updateActivatedNetworks = (selected: ActivatedNetwork[]) => {
    form.setFieldValue('activatedNetworks', selected)
  }

  const ActivateSwitch = useMemo(() => ({ row }:{ row: NetworkSaveData }) => {
    const isActivated = _.findIndex(activated, { id: row.id })

    return <Switch
      aria-label={`activate-btn-${row.id}`}
      checked={isActivated !== -1}
      onChange={(checked: boolean) => {
        let newSelected
        if (checked) {
          newSelected = _.unionBy(activated,
            [_.pick(row, ['id', 'name'])], 'id')
        } else {
          newSelected = [...activated!]
          _.remove(newSelected,
            _.pick(row, ['id', 'name']))
        }

        updateActivatedNetworks(newSelected)
      }}
      checkedChildren={$t({ defaultMessage: 'ON' })}
      unCheckedChildren={$t({ defaultMessage: 'OFF' })}
    />
  }, [$t, form, activated])

  const columns: TableProps<NetworkSaveData>['columns'] = useMemo(() => ([
    {
      title: $t({ defaultMessage: 'Active Network' }),
      tooltip: $t({ defaultMessage:
        'A list of the networks that have been activated on this venue.' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Network Type' }),
      key: 'type',
      dataIndex: 'type',
      render: (_, row) => {
        return $t(networkTypes[row.type!])
      }
    },
    {
      title: $t({ defaultMessage: 'Activate on Venue' }),
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      width: 80,
      render: (_, row) => {
        return <ActivateSwitch row={row}/>
      }
    }
  ]), [$t, ActivateSwitch])

  return (
    <Table
      rowKey='id'
      columns={columns}
      dataSource={networkList}
    />
  )}

export const ScopeForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeCentralizedForwardingSetting>()
  const venueId = form.getFieldValue('venueId')
  const venueName = form.getFieldValue('venueName')

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
            {$t({
              defaultMessage:
                // eslint-disable-next-line max-len
                'Activate networks for the centralized forwarding service on the venue ({venueName}):'
            }, {
              venueName: <Typography.Text strong>{venueName}</Typography.Text>
            })}
          </Typography.Text>
        </Col>
      </Row>
      <Row >
        <Col span={18}>
          <Form.Item
            name='activatedNetworks'
            valuePropName='data'
            noStyle
            initialValue={[]}
          >
            <ActivatedNetworksTable venueId={venueId} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
