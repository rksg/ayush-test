import { Col, Row } from 'antd'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Table,
  TableProps,
  Tooltip,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useDeleteEdgeFirewallMutation,
  useGetEdgeFirewallViewDataListQuery,
  useGetEdgeListQuery
} from '@acx-ui/rc/services'
import {
  EdgeFirewallViewData,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  useTableQuery,
  DdosAttackType
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

const edgeOptionsDefaultPayload = {
  fields: ['name', 'serialNumber'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const FirewallTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeFirewallViewDataListQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'firewallName',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['firewallName']
    }
  })
  const { edgeOptions } = useGetEdgeListQuery(
    { payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          edgeOptions: data?.data.map((item) => ({
            value: item.name,
            key: item.serialNumber
          }))
        }
      }
    }
  )
  const [deleteEdgeFirewall, { isLoading: isDeletingEdgeFirewall }] =
    useDeleteEdgeFirewallMutation()

  const columns: TableProps<EdgeFirewallViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'firewallName',
      dataIndex: 'firewallName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_FIREWALL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}
          >
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'DDoS Rate-limiting' }),
      key: 'ddosEnabled',
      dataIndex: 'ddosEnabled',
      align: 'center',
      sorter: true,
      render: (data, row) => {
        return row.ddosEnabled
          ? <Tooltip
            placement='bottom'
            title={
              () => (
                row.ddosRateLimitingRules &&
                  Object.keys(row.ddosRateLimitingRules).map(key => (
                    <Row>
                      <Col>
                        {
                          // eslint-disable-next-line max-len
                          `${key}: ${row.ddosRateLimitingRules![key as keyof typeof DdosAttackType]}`
                        }
                      </Col>
                    </Row>
                  ))
              )
            }
          >
            <span data-testid={`ddos-info-${row.id}`}>
              {
                row.ddosRateLimitingRules
                  ? Object.keys(row.ddosRateLimitingRules).length
                  : 0
              }
            </span>
          </Tooltip>
          : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Stateful ACL' }),
      key: 'statefulAclEnabled',
      dataIndex: 'statefulAclEnabled',
      align: 'center',
      sorter: true,
      render: (data, row) => {
        return row.statefulAclEnabled &&
        <Tooltip
          placement='bottom'
          title={
            () => (
              row.statefulAcls?.map(item => (
                <Row key={item.aclDirection}>
                  <Col>
                    {`${item.aclName} (${item.aclDirection.toLowerCase()})`}
                  </Col>
                </Row>
              ))
            )
          }
        >
          <UI.StyledCheckMark data-testid={`acl-check-mark-${row.id}`} />
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdges' }),
      key: 'edgeIds',
      dataIndex: 'edgeIds',
      align: 'center',
      filterable: edgeOptions,
      render: (data, row) => {
        return (row.edgeIds && row.edgeIds.length)
          ? <Tooltip
            placement='bottom'
            title={
              row.edgeIds.map(edgeSN => (
                <Row>
                  { _.find(edgeOptions, { key: edgeSN })?.value || '' }
                </Row>
              ))
            }
          >
            <span data-testid={`edge-names-${row.id}`}>{row.edgeIds.length}</span>
          </Tooltip>
          : row.edgeIds?.length
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      key: 'updateAvailable',
      dataIndex: 'updateAvailable',
      align: 'center',
      render: () => {
        return $t({ defaultMessage: 'No' })
      }
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      key: 'serviceVersion',
      dataIndex: 'serviceVersion'
    }
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render: (data) => {
    //     return `${data}`
    //   }
    // }
  ]

  const rowActions: TableProps<EdgeFirewallViewData>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
            `${basePath.pathname}/` +
            getServiceDetailsLink({
              type: ServiceType.EDGE_FIREWALL,
              oper: ServiceOperation.EDIT,
              serviceId: selectedRows[0].id!
            })
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Firewall' }),
            entityValue: rows.length === 1 ? rows[0].firewallName : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1
              ? deleteEdgeFirewall({ params: { serviceId: rows[0].id } }).then(
                clearSelection
              )
              : deleteEdgeFirewall({
                payload: rows.map((item) => item.id)
              }).then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={$t(
          { defaultMessage: 'Firewall ({count})' },
          { count: tableQuery.data?.totalCount }
        )}
        breadcrumb={
          isNavbarEnhanced
            ? [
              { text: $t({ defaultMessage: 'Network Control' }) },
              {
                text: $t({ defaultMessage: 'My Services' }),
                link: getServiceListRoutePath(true)
              }
            ]
            : [
              {
                text: $t({ defaultMessage: 'My Services' }),
                link: getServiceListRoutePath(true)
              }
            ]
        }
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink
            to={getServiceRoutePath({
              type: ServiceType.EDGE_FIREWALL,
              oper: ServiceOperation.CREATE
            })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add Firewall Service' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader
        states={[
          tableQuery,
          { isLoading: false, isFetching: isDeletingEdgeFirewall }
        ]}
      >
        <Table
          settingsId='services-firewall-table'
          rowKey='id'
          columns={columns}
          rowSelection={{ type: 'checkbox' }}
          rowActions={filterByAccess(rowActions)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

export default FirewallTable
