import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteResidentPortalsMutation, useGetQueriableResidentPortalsQuery, useGetResidentPortalListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  useTableQuery,
  ResidentPortal,
  getServiceDetailsLink
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                               from '@acx-ui/user'

export default function ResidentPortalTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
    const [ deleteResidentPortals ] = useDeleteResidentPortalsMutation()

  // const tableQuery = useTableQuery({ useQuery: useGetResidentPortalListQuery, defaultPayload: {} })
  const tableQuery = useTableQuery({
    useQuery: useGetQueriableResidentPortalsQuery,
    defaultPayload: {
      filters: {},
      fields: ['id']
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const rowActions: TableProps<ResidentPortal>['rowActions'] = [
    {
      // TODO: update this to not allow deletion when portal is in use????
      label: intl.$t({ defaultMessage: 'Delete' }),
      // TODO: visible: ([selectedRow]) => selectedRow && !selectedRow.identityId,
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            // TODO: add confirmation text? "Any Venues using this portal will revert to the default" ???
            action: 'DELETE',
            entityName: intl.$t({ defaultMessage: 'Resident Portal' }),
            entityValue: name
          },
          onOk: async () => {
            try {
              await deleteResidentPortals({ payload: [id] }).unwrap()
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
      fixed: 'left',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'title',
      title: intl.$t({ defaultMessage: 'Title' }),
      dataIndex: ['uiConfiguration','text','title'],
      // align: 'center'
    },
    {
      key: 'subtitle',
      title: intl.$t({ defaultMessage: 'Subtitle' }),
      dataIndex: ['uiConfiguration','text','subTitle'],
      // align: 'center'
    }
  ]
  
  return (
    <>
      <PageHeader
        title={
          intl.$t({ defaultMessage: 'Resident Portals ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.CREATE })}>
            {/* TODO: verify Table language is correct */}
            <Button type='primary'>{intl.$t({ defaultMessage: 'Add Resdient Portal' })}</Button>
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
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
