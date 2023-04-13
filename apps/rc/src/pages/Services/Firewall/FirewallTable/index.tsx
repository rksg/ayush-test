import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table }                                           from '@acx-ui/components'
import { ServiceOperation, ServiceType, getServiceListRoutePath, getServiceRoutePath } from '@acx-ui/rc/utils'
import { TenantLink }                                                                  from '@acx-ui/react-router-dom'
import { filterByAccess }                                                              from '@acx-ui/user'

const FirewallTable = () => {

  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'DHCP for SmartEdge ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.FIREWALL, oper: ServiceOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Firewall Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteDhcpUpdating }
      ]}>
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