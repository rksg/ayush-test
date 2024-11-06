import { useMemo } from 'react'

import { Col, Form, Row, Typography } from 'antd'
import { get, groupBy, isNil, pick }  from 'lodash'
import { useIntl }                    from 'react-intl'

import { Loader, StepsForm, Table, TableProps, useStepFormContext } from '@acx-ui/components'
import { useVenuesListQuery }                                       from '@acx-ui/rc/services'
import {
  EdgeMdnsProxyActivation,
  EdgeMdnsProxyViewData,
  arraySizeSort,
  defaultSort,
  sortProp,
  transformDisplayNumber
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { CountAndNamesTooltip } from '../../../CountAndNamesTooltip'
import { messageMappings }      from '../messageMappings'

import { EdgeClustersDrawer } from './EdgeClustersDrawer'

export interface VenueTableDataType {
  id: string
  name: string
  address: string
  selectedClusters: EdgeMdnsProxyActivation[]
}

export interface VenueNetworksTableProps {
  activations?: EdgeMdnsProxyActivation[],
}

export const VenuesTable = (props: VenueNetworksTableProps) => {
  const { $t } = useIntl()
  const { activations } = props
  const { form: formRef } = useStepFormContext<EdgeMdnsProxyViewData>()

  const { availableVenues, isLoading, isFetching } = useVenuesListQuery({
    payload: {
      fields: ['name', 'country', 'city', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      availableVenues: data?.data.map(item => ({
        ...pick(item, ['id', 'name']),
        address: `${item.country}, ${item.city}`,
        selectedClusters: get(groupBy(activations, 'venueId'), item.id) ?? []
      }))
    })
  })

  const columns: TableProps<VenueTableDataType>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Address' }),
    width: Infinity,
    key: 'address',
    dataIndex: 'address',
    sorter: { compare: sortProp('address', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Selected Edge Clusters' }),
    key: 'selectedClusters',
    dataIndex: 'selectedClusters',
    align: 'center' as const,
    width: 100,
    sorter: { compare: sortProp('selectedClusters', arraySizeSort) },
    render: (_, row) => {
      const selectedClusters = row.selectedClusters
      const clusterCount = transformDisplayNumber(selectedClusters?.length)
      const clusterNames = selectedClusters
        ?.map(item => item.edgeClusterName)
        ?.filter(Boolean)

      return clusterCount > 0
        ? <CountAndNamesTooltip data={{
          count: clusterCount,
          names: clusterNames.sort(defaultSort) as string[]
        }}
        />
        : clusterCount
    }
  }]), [activations])

  const rowActions: TableProps<VenueTableDataType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Select RUCKUS Edge clusters' }),
    onClick: (selectedRows) => {
      formRef.setFieldValue('selectedVenueId', selectedRows[0].id)
    }
  }]

  const closeDrawer = () => {
    formRef.setFieldValue('selectedVenueId', undefined)
  }

  const handleSubmit = (venueId: string, updates: EdgeMdnsProxyActivation[] | undefined) => {
    if (isNil(updates)) return

    // update `updates` on a specific venue
    const activations = (formRef.getFieldValue('activations') ?? []) as EdgeMdnsProxyActivation[]
    const updatedActivations = activations.filter(item => item.venueId !== venueId)
    updatedActivations.push(...updates)

    formRef.setFieldValue('activations', updatedActivations)
    formRef.validateFields(['activations'])
    closeDrawer()
  }

  return (
    <>
      <Loader states={[ { isLoading, isFetching } ]}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={availableVenues}
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
      <Form.Item name={['selectedVenueId']} valuePropName='venueId'>
        <EdgeClustersDrawer
          onClose={closeDrawer}
          onSubmit={handleSubmit}
          activations={activations}
          availableVenues={availableVenues}
        />
      </Form.Item>
    </>
  )
}

export const ScopeForm = () => {
  const { $t } = useIntl()

  return <>
    <Row>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Typography.Text>
          {$t(messageMappings.scope_clusters_table_description)}
        </Typography.Text>

        <Form.Item
          name='activations'
          valuePropName='activations'
        >
          <VenuesTable />
        </Form.Item>
      </Col>
    </Row>
  </>
}