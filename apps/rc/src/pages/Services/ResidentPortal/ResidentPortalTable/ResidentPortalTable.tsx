import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteResidentPortalsMutation,
  useGetQueriableResidentPortalsQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  useTableQuery,
  ResidentPortal,
  getServiceDetailsLink,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  getServiceAllowedOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

export default function ResidentPortalTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteResidentPortals ] = useDeleteResidentPortalsMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetQueriableResidentPortalsQuery,
    defaultPayload: {
      filters: {},
      fields: ['id']
    }
  })

  const rowActions: TableProps<ResidentPortal>['rowActions'] = [
    {
      label: intl.$t({ defaultMessage: 'Delete' }),
      disabled: (([selectedRow]) => (selectedRow && !selectedRow.venueCount)? false : true),
      tooltip: (([selectedRow]) => (selectedRow && !selectedRow.venueCount)?
        undefined
        : intl.$t({ defaultMessage: 'Cannot delete Resident Portal while ' +
          '<VenuePlural></VenuePlural> are using it.' })),
      scopeKey: getScopeKeyByService(ServiceType.RESIDENT_PORTAL, ServiceOperation.DELETE),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.RESIDENT_PORTAL, ServiceOperation.DELETE),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: intl.$t({ defaultMessage: 'Resident Portal' }),
            entityValue: name
          },
          onOk: () => {
            deleteResidentPortals({ payload: [id] })
              .then(clearSelection)
              .catch((error) =>
                console.log(error) // eslint-disable-line no-console
              )
          }
        })
      }
    },
    {
      label: intl.$t({ defaultMessage: 'Edit' }),
      scopeKey: getScopeKeyByService(ServiceType.RESIDENT_PORTAL, ServiceOperation.EDIT),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.RESIDENT_PORTAL, ServiceOperation.EDIT),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.RESIDENT_PORTAL,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]

  const columns: TableProps<ResidentPortal>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: function (_, row, __, highlightFn) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {highlightFn(row.name)}
          </TenantLink>
        )
      }
    },
    {
      // NOTE: Turning off sorting for the time being as these fields can't be sorted.
      //  sorting uses the 'key' field, while dataIndex is used to present the data.
      // sorter: true,
      key: 'uiConfiguration.text.title',
      title: intl.$t({ defaultMessage: 'Title' }),
      dataIndex: ['uiConfiguration','text','title']
    },
    {
      key: 'subtitle',
      title: intl.$t({ defaultMessage: 'Subtitle' }),
      dataIndex: ['uiConfiguration','text','subTitle']
    },
    {
      key: 'venueCount',
      title: intl.$t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: ['venueCount']
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          intl.$t({ defaultMessage: 'Resident Portals ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Network Control' }) },
          {
            text: intl.$t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getServiceRoutePath({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.CREATE })
            }
            rbacOpsIds={getServiceAllowedOperation(
              ServiceType.RESIDENT_PORTAL,
              ServiceOperation.CREATE
            )}
            scopeKey={getScopeKeyByService(ServiceType.RESIDENT_PORTAL, ServiceOperation.CREATE)}
          >
            <Button type='primary'>{intl.$t({ defaultMessage: 'Add Resident Portal' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<ResidentPortal>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
        />
      </Loader>
    </>
  )
}
