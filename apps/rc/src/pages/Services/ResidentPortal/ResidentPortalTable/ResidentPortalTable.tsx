import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { useDeleteResidentPortalsMutation,
  useGetQueriableResidentPortalsQuery } from '@acx-ui/rc/services'
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
      visible: ([selectedRow]) => selectedRow && !selectedRow.venueCount,
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
      render: function (data, row, _, highlightFn) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {highlightFn(data as string)}
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
      title: intl.$t({ defaultMessage: 'Venues' }),
      dataIndex: ['venueCount']
    }
  ]

  return (
    <>
      <PageHeader
        title={
          intl.$t({ defaultMessage: 'Resident Portals ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={isNavbarEnhanced ? [
          { text: intl.$t({ defaultMessage: 'Network Control' }) },
          {
            text: intl.$t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true) }
        ] : [{
          text: intl.$t({ defaultMessage: 'My Services' }),
          link: getServiceListRoutePath(true)
        }]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={
            getServiceRoutePath({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.CREATE })}>
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
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
