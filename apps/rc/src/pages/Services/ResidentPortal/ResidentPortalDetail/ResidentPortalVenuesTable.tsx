import { useIntl }         from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteResidentPortalsMutation, useGetQueriablePropertyConfigsQuery, useGetQueriableResidentPortalsQuery, useGetResidentPortalListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  useTableQuery,
  ResidentPortal,
  getServiceDetailsLink,
  PropertyConfigs
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                               from '@acx-ui/user'
import { Typography } from 'antd'


export default function ResidentPortalVenuesTable () {
  const params = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()

  
  
  const tenantBasePath: Path = useTenantLink('')
    const [ deleteResidentPortals ] = useDeleteResidentPortalsMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetQueriablePropertyConfigsQuery,
    defaultPayload: {
      // filters: {},
      filters: { residentPortalId: params.serviceId },
      fields: ['id', 'venueId', 'venueName'],
    },
    sorter: {
      sortField: 'venueName',
      sortOrder: 'ASC'
    }
  })

  // const rowActions: TableProps<PropertyConfigs>['rowActions'] = [
  //   {
  //     // TODO: update this to not allow deletion when portal is in use????
  //     label: $t({ defaultMessage: 'Delete' }),
  //     // TODO: visible: ([selectedRow]) => selectedRow && !selectedRow.identityId, -- don't be visible if portal is in use
  //     onClick: ([{ id, name }], clearSelection) => {
  //       showActionModal({
  //         type: 'confirm',
  //         customContent: {
  //           action: 'DELETE',
  //           entityName: $t({ defaultMessage: 'Resident Portal' }),
  //           entityValue: name
  //         },
  //         onOk: async () => {
  //           try {
  //             await deleteResidentPortals({ payload: [id] }).unwrap()
  //             clearSelection()
  //           } catch (error) {
  //             console.log(error) // eslint-disable-line no-console
  //           }
  //         }
  //       })
  //     }
  //   },
  //   {
  //     label: $t({ defaultMessage: 'Edit' }),
  //     onClick: ([{ id }]) => {
  //       navigate({
  //         ...tenantBasePath,
  //         pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
  //           type: ServiceType.RESIDENT_PORTAL,
  //           oper: ServiceOperation.EDIT,
  //           serviceId: id!
  //         })
  //       })
  //     }
  //   }
  // ]

  const columns: TableProps<PropertyConfigs>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venueName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (data, row, _, highlightFn) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {/* {searchable ? highlightFn(row.venueName) : data} */}
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description'
    },
    // { NOTE: this will always be enabled because the property config gets deleted when disabled
    //   key: 'status',
    //   title: $t({ defaultMessage: 'Status' }),
    //   dataIndex: 'status'
    // }
  ]
  
  return (
    <>
      <Typography.Title level={2}>
        {$t({ defaultMessage: 'Instances ({count})' }, { count: tableQuery.data?.totalCount })}
      </Typography.Title>
      <Loader states={[tableQuery]}>
        <Table<PropertyConfigs>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          // rowActions={filterByAccess(rowActions)}nvm 
          // rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
      {/* <Typography.Title level={2}>
                {$t({ defaultMessage: 'Instances ({count})' },
                  { count: 0 })}
              </Typography.Title>
              <Table
                columns={columns}
                rowKey='id'
                // rowActions={filterByAccess(rowActions)}
                rowSelection={{ type: 'checkbox' }}
              /> */}
   
}



