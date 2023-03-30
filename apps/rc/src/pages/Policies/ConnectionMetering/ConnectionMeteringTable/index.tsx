import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  showActionModal,
  showToast
} from '@acx-ui/components'
import {
  useGetConnectionMeteringListQuery,
  useDeleteConnectionMeteringMutation
} from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  ConnectionMetering,
  getPolicyDetailsLink
} from '@acx-ui/rc/utils'
import {
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import {
  DataConsumptionLabel
} from '../DataConsumptionHelper'
import { ConnectionMeteringLink } from '../LinkHelper'
import { RateLimitingTableCell }  from '../RateLimitingHelper'


function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<ConnectionMetering>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => <ConnectionMeteringLink name={row.name} id={row.id}/>
    },
    {
      key: 'rateLimit',
      title: $t({ defaultMessage: 'Rate Limiting' }),
      dataIndex: 'rateLimit',
      sorter: false,
      render: (_, row) =>
        <RateLimitingTableCell uploadRate={row.uploadRate} downloadRate={row.downloadRate}/>
    },
    {
      key: 'dataConsumption',
      title: $t({ defaultMessage: 'Data Consumption' }),
      dataIndex: 'dataConsumption',
      render: (_, row) => {
        return <DataConsumptionLabel {...{ onOffShow: '', ...row }}/>
      }
    },
    {
      key: 'unitCount',
      title: $t({ defaultMessage: 'Units' }),
      dataIndex: 'unitCount',
      sorter: true,
      align: 'center'
    },
    {
      key: 'venueCount',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueCount',
      sorter: true,
      align: 'center'
    },
    {
      key: 'venue',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venue',
      show: false,
      filterable: true
    }
  ]

  return columns
}


export default function ConnectionMeteringTable () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery( {
    useQuery: useGetConnectionMeteringListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: {}
  })
  const tenantBasePath = useTenantLink('')
  const navigate = useNavigate()

  const [deleteConnectionMetering] = useDeleteConnectionMeteringMutation()

  const rowActions: TableProps<ConnectionMetering>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data],clearSelection) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.CONNECTION_METERING,
            oper: PolicyOperation.EDIT,
            policyId: data.id
          })
        })
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Profile' }),
            entityValue: selectedItems[0].name,
            numOfEntities: selectedItems.length
          },
          content:
            $t({
              // Display warning while one of the Connection metering in used.
              defaultMessage: `{hasUnits, select,
              true {The connection metering is in used.}
              other {}
              }
              Are you sure you want to delete this connection metering?`
            }, {
              hasUnits: !!selectedItems.find(p => (p?.unitCount ?? 0) > 0)
            }),
          onOk: () => {
            const id = selectedItems[0].id
            const name = selectedItems[0].name
            deleteConnectionMetering({ params: { id } })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  // eslint-disable-next-line max-len
                  content: $t({ defaultMessage: 'Connection Metering {name} was deleted' }, { name })
                })
                clearSelection()
              }).catch((e) => {
                showToast({
                  type: 'error',
                  content: $t(
                    { defaultMessage: 'An error occurred {detail}' },
                    { detail: e?.data?.message ?? undefined }
                  )
                })
              })
          }
        })
      }
    }
  ]

  const source: ConnectionMetering [] = [{
    id: 'test',
    name: 'test',
    uploadRate: 0,
    downloadRate: 10,
    dataCapacity: 100,
    dataCapacityEnforced: false,
    dataCapacityThreshold: 10,
    billingCycleRepeat: false,
    billingCycleType: 'CYCLE_UNSPECIFIED',
    venueCount: 1,
    unitCount: 1
  }, {
    id: 'test2',
    name: 'test2',
    uploadRate: 0,
    downloadRate: 10,
    dataCapacity: 100,
    dataCapacityEnforced: false,
    dataCapacityThreshold: 10,
    billingCycleRepeat: true,
    billingCycleType: 'CYCLE_MONTHLY',
    venueCount: 1,
    unitCount: 1
  }]

  return (
    <>
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={$t({ defaultMessage: 'Connection Metering' })}
        extra={[
          <TenantLink
            key='add'
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.CREATE })}
          >
            <Button type='primary'>
              { $t({ defaultMessage: 'Add Connection metering profile' }) }
            </Button>
          </TenantLink>
        ]}
      />
      <Table
        enableApiFilter
        columns={useColumns()}
        dataSource={source}
        rowActions={rowActions}
        //dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowSelection={{ type: 'radio' }}
      />
    </>
  )
}