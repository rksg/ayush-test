import { useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteEdgeTnmServiceMutation, useGetEdgeTnmServiceListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getServiceListRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  EdgeTnmServiceData,
  transformDisplayNumber,
  getServiceDetailsLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EdgeTnmCreateFormModal } from './EdgeTnmCreateFormModal'

const settingsId = 'services-edge-tnm-service-table'
export function EdgeTnmServiceTable () {
  const { $t } = useIntl()
  const [visible, setVisible] = useState<boolean>(false)

  const [ deleteFn, { isLoading: isDeleting } ] = useDeleteEdgeTnmServiceMutation()
  const { data, isLoading, isFetching } = useGetEdgeTnmServiceListQuery({})

  const rowActions: TableProps<EdgeTnmServiceData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edge TNM Service' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({
              params: { edgeClusterId: row.id, venueId: row.venueId } }).unwrap()))
              .then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.DELETE)
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'Thirdparty Network Management ({count})' },
            { count: transformDisplayNumber(data?.length) })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <Button type='primary'
            scopeKey={getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.CREATE)}
            onClick={() => {
              setVisible(true)
            }}>
            {$t({ defaultMessage: 'Add TNM Service' })}
          </Button>
        ])}
      />
      <Loader states={[{ isLoading, isFetching: isFetching || isDeleting }]}>
        <Table
          rowKey='id'
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={data}
          rowActions={allowedRowActions}
          rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
        />
      </Loader>
      <EdgeTnmCreateFormModal
        visible={visible}
        setVisible={setVisible}
      />
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<EdgeTnmServiceData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) =>
        <TenantLink
          to={getServiceDetailsLink({
            type: ServiceType.EDGE_TNM_SERVICE,
            oper: ServiceOperation.DETAIL,
            serviceId: row.id!
          })}>
          {row.name}
        </TenantLink>
    },
    {
      key: 'version',
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'version',
      align: 'center',
      sorter: true,
      render: (_, row) =>
        <Row justify='center'>
          {row.version}
        </Row>
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'status',
      dataIndex: 'stauts',
      width: 80,
      align: 'center',
      render: (_, row) =>
        <Row justify='center'>
          {row.status}
        </Row>
    }
  ]

  return columns
}