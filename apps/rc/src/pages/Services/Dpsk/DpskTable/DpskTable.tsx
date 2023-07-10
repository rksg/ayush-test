import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                 from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                                                        from '@acx-ui/rc/components'
import { doProfileDelete, useDeleteDpskMutation, useGetEnhancedDpskListQuery, useNetworkListQuery } from '@acx-ui/rc/services'
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
  getServiceListRoutePath,
  PassphraseFormatEnum,
  displayDeviceCountLimit
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                               from '@acx-ui/types'
import { filterByAccess, hasAccess, hasRoles }                     from '@acx-ui/user'

import { displayDefaultAccess } from '../utils'

const defaultPayload = {
  filters: {}
}
const defaultSearch = {
  searchTargetFields: ['name'],
  searchString: ''
}

export default function DpskTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteDpsk ] = useDeleteDpskMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedDpskListQuery,
    defaultPayload,
    search: defaultSearch
  })

  const doDelete = (selectedRow: DpskSaveData, callback: () => void) => {
    doProfileDelete(
      [selectedRow],
      intl.$t({ defaultMessage: 'DPSK Service' }),
      selectedRow.name,
      [
        { fieldName: 'identityId', fieldText: intl.$t({ defaultMessage: 'Persona' }) },
        { fieldName: 'networkIds', fieldText: intl.$t({ defaultMessage: 'Network' }) }
      ],
      async () => deleteDpsk({ params: { serviceId: selectedRow.id } }).then(callback)
    )
  }

  const rowActions: TableProps<DpskSaveData>['rowActions'] = [
    {
      label: intl.$t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => doDelete(selectedRow, clearSelection)
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

  const breadCrumb = !hasRoles(RolesEnum.DPSK_ADMIN)
    ? (isNavbarEnhanced ? [
      { text: intl.$t({ defaultMessage: 'Network Control' }) },
      {
        text: intl.$t({ defaultMessage: 'My Services' }),
        link: getServiceListRoutePath(true)
      }
    ] : [{
      text: intl.$t({ defaultMessage: 'My Services' }),
      link: getServiceListRoutePath(true)
    }])
    : []

  const title = !hasRoles(RolesEnum.DPSK_ADMIN)
    ? intl.$t({ defaultMessage: 'DPSK ({count})' }, { count: tableQuery.data?.totalCount })
    : <Space split={<Divider type='vertical'/>}>
      <span>{intl.$t({ defaultMessage: 'DPSK Management' })}</span>
      <span>{intl.$t({ defaultMessage: 'DPSK Services ({count})' },
        { count: tableQuery.data?.totalCount })}
      </span>
    </Space>

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={breadCrumb}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })}>
            <Button type='primary'>{intl.$t({ defaultMessage: 'Add DPSK Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<DpskSaveData>
          settingsId='dpsk-table'
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const intl = useIntl()
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const params = useParams()

  const { networkNameMap } = useNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : []
    })
  })

  const passphraseFormatOptions = Object.keys(PassphraseFormatEnum).map((key =>
    ({ key, value: transformDpskNetwork(intl, DpskNetworkType.FORMAT, key) })
  ))

  const columns: TableProps<DpskSaveData>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
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
      filterKey: 'passphraseFormat',
      filterable: passphraseFormatOptions,
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
      align: 'center',
      sorter: true
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
      render: function (data, row) {
        if (!row.networkIds || row.networkIds.length === 0) return 0
        // eslint-disable-next-line max-len
        const tooltipItems = networkNameMap.filter(v => row.networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={row.networkIds.length} />
      }
    },
    {
      key: 'deviceCountLimit',
      title: intl.$t({ defaultMessage: 'Devices allowed per passphrase' }),
      dataIndex: 'deviceCountLimit',
      show: isCloudpathEnabled,
      sorter: true,
      render: function (data, row) {
        return displayDeviceCountLimit(row.deviceCountLimit)
      }
    },
    {
      key: 'policyDefaultAccess',
      title: intl.$t({ defaultMessage: 'Default Access' }),
      dataIndex: 'policyDefaultAccess',
      show: isCloudpathEnabled,
      sorter: true,
      render: function (data, row) {
        return displayDefaultAccess(row.policyDefaultAccess)
      }
    }
  ]

  return columns
}
