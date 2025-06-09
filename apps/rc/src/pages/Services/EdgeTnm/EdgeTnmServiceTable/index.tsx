import { useState } from 'react'

import { Row, Space } from 'antd'
import { useIntl }    from 'react-intl'

import {
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button
} from '@acx-ui/components'
import { useDeleteEdgeTnmServiceMutation, useGetEdgeTnmServiceListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  EdgeTnmServiceData,
  transformDisplayNumber,
  getServiceDetailsLink,
  EdgeTnmServiceStatusEnum,
  useServicesBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import {
  noDataDisplay
} from '@acx-ui/utils'

import { EdgeTnmCreateFormModal } from './EdgeTnmCreateFormModal'
import * as UI                    from './styledComponents'

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
            entityName: $t({ defaultMessage: 'Edge Thirdparty Network Management Service' }),
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
        breadcrumb={useServicesBreadcrumb()}
        extra={filterByAccessForServicePolicyMutation([
          <Button type='primary'
            scopeKey={getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.CREATE)}
            onClick={() => {
              setVisible(true)
            }}>
            {$t({ defaultMessage: 'Add Thirdparty Network Management Service' })}
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
        row.status === EdgeTnmServiceStatusEnum.UP
          ? <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_TNM_SERVICE,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
          : row.name
    },
    {
      key: 'version',
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'version',
      align: 'center',
      sorter: true,
      render: (_, row) =>
        <Row justify='center'>
          {row.status === EdgeTnmServiceStatusEnum.INSTALLING ? noDataDisplay : row.version}
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
          <TnmServiceStatus status={row.status} />
        </Row>
    }
  ]

  return columns
}

const TnmServiceStatus = (props:{ status: EdgeTnmServiceStatusEnum | undefined }) => {
  const { $t } = useIntl()

  switch(props.status) {
    case EdgeTnmServiceStatusEnum.UP:
      return <Space><UI.CheckMarkCircleSolidIcon/>{$t({ defaultMessage: 'Up' })}</Space>
    case EdgeTnmServiceStatusEnum.INSTALLING:
      return <Space><UI.CheckingIcon/>{$t({ defaultMessage: 'Installing' })}</Space>
    case EdgeTnmServiceStatusEnum.DOWN:
      return <Space><UI.UnavailableIcon/>{$t({ defaultMessage: 'Down' })}</Space>
    default:
      return <Space><UI.UnknownIcon/>{$t({ defaultMessage: 'Unkown' })}</Space>
  }
}
