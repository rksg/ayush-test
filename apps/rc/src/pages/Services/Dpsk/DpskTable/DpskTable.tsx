import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { useDeleteDpskMutation, useGetDpskListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  DpskSaveData,
  transformDpskNetwork,
  DpskNetworkType,
  transformAdvancedDpskExpirationText,
  DpskDetailsTabKey,
  getServiceListRoutePath
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                               from '@acx-ui/user'

import { displayDefaultAccess, displayDeviceCountLimit } from '../utils'

export default function DpskTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteDpsk ] = useDeleteDpskMutation()
  const isCloudpathEnabled = useIsSplitOn(Features.DPSK_CLOUDPATH_FEATURE)

  const tableQuery = useTableQuery({ useQuery: useGetDpskListQuery, defaultPayload: {} })

  const rowActions: TableProps<DpskSaveData>['rowActions'] = [
    {
      label: intl.$t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: intl.$t({ defaultMessage: 'DPSK Service' }),
            entityValue: name
          },
          onOk: async () => {
            try {
              await deleteDpsk({ params: { serviceId: id } }).unwrap()
              clearSelection()
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
          }
        })
      }
    },
    {
      label: intl.$t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.DPSK,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]

  const columns: TableProps<DpskSaveData>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.DPSK,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!,
              activeTab: DpskDetailsTabKey.OVERVIEW
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'passphraseFormat',
      title: intl.$t({ defaultMessage: 'Passphrase Format' }),
      dataIndex: 'passphraseFormat',
      sorter: true,
      render: function (data) {
        return transformDpskNetwork(
          intl,
          DpskNetworkType.FORMAT,
          data as string
        )
      }
    },
    {
      key: 'passphraseLength',
      title: intl.$t({ defaultMessage: 'Passphrase Length' }),
      dataIndex: 'passphraseLength',
      align: 'center'
    },
    {
      key: 'expirationType',
      title: intl.$t({ defaultMessage: 'Passphrase Expiration' }),
      dataIndex: 'expirationType',
      render: function (data, row) {
        return transformAdvancedDpskExpirationText(
          intl,
          {
            expirationType: row.expirationType,
            expirationDate: row.expirationDate,
            expirationOffset: row.expirationOffset
          }
        )
      }
    },
    {
      key: 'networkIds',
      title: intl.$t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      align: 'center',
      render: function (data) {
        return data ? (data as Array<string>).length : 0
      }
    },
    {
      key: 'deviceCountLimit',
      title: intl.$t({ defaultMessage: 'Devices allowed per passphrase' }),
      dataIndex: 'deviceCountLimit',
      show: isCloudpathEnabled,
      render: function (data, row) {
        return displayDeviceCountLimit(row.deviceCountLimit)
      }
    },
    {
      key: 'policyDefaultAccess',
      title: intl.$t({ defaultMessage: 'Default Access' }),
      dataIndex: 'policyDefaultAccess',
      show: isCloudpathEnabled,
      render: function (data, row) {
        return displayDefaultAccess(row.policyDefaultAccess)
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          intl.$t({ defaultMessage: 'DPSK ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })}>
            <Button type='primary'>{intl.$t({ defaultMessage: 'Add DPSK Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<DpskSaveData>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
