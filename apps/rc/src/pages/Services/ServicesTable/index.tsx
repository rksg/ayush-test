import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal, showToast } from '@acx-ui/components'
import {
  useDeleteWifiCallingServiceMutation,
  useDeleteMdnsProxyMutation,
  useServiceListQuery,
  useDeletePortalMutation,
  useDeleteDHCPServiceMutation
} from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  Service,
  ServiceTechnology,
  getSelectServiceRoutePath,
  getServiceDetailsLink,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { serviceTypeLabelMapping, serviceTechnologyLabelMapping } from '../contentsMap'
import { DEFAULT_GUEST_DHCP_NAME }                                from '../DHCP/DHCPForm/DHCPForm'

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Service>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Service Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: row.type as ServiceType,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Service Type' }),
      dataIndex: 'type',
      sorter: true,
      render: function (data) {
        return $t(serviceTypeLabelMapping[data as ServiceType])
      }
    },
    // # The fields have not been defined
    // {
    //   key: 'status',
    //   title: $t({ defaultMessage: 'Status' }),
    //   dataIndex: 'status',
    //   sorter: true,
    //   render: function (data) {
    //     return $t(serviceStatusLabelMapping[data as ServiceStatus])
    //   }
    // },
    // {
    //   key: 'adminState',
    //   title: $t({ defaultMessage: 'Admin State' }),
    //   dataIndex: 'adminState',
    //   sorter: true,
    //   render: function (data) {
    //     return $t(serviceAdminStateLabelMapping[data as ServiceAdminState])
    //   }
    // },
    {
      key: 'technology',
      title: $t({ defaultMessage: 'Technology' }),
      dataIndex: 'technology',
      sorter: true,
      render: function (data) {
        return $t(serviceTechnologyLabelMapping[data as ServiceTechnology])
      }
    },
    {
      key: 'scope',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scope',
      sorter: true,
      align: 'center'
    },
    // # The field has not been defined
    // {
    //   key: 'health',
    //   title: $t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags'
    }
  ]

  return columns
}

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'id',
    'name',
    'type',
    'status',
    'adminState',
    'technology',
    'scope',
    'cog',
    'health',
    'tags'
  ]
}

export default function ServicesTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const tableQuery = useTableQuery({
    useQuery: useServiceListQuery,
    defaultPayload
  })
  const deleteServiceFnMapping = {
    [ServiceType.DHCP]: useDeleteDHCPServiceMutation(),
    [ServiceType.DPSK]: [], // TODO: API not ready
    [ServiceType.MDNS_PROXY]: useDeleteMdnsProxyMutation(),
    [ServiceType.PORTAL]: useDeletePortalMutation(),
    [ServiceType.WIFI_CALLING]: useDeleteWifiCallingServiceMutation(),
    [ServiceType.NETWORK_SEGMENTATION]: [], // TODO: API not ready
    [ServiceType.WEBAUTH_SWITCH]: [] // TODO: API not ready
  }

  const rowActions: TableProps<Service>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedRows) => {
        const hasBlockObj = _.find(selectedRows,
          (o)=> {
            if(o.type === ServiceType.DHCP){
              if(o.scope!==0){
                return true
              }
              else if(o.name===DEFAULT_GUEST_DHCP_NAME){
                return true
              }
            }
            return false
          })

        if(_.isEmpty(hasBlockObj)){
          return true
        }else{
          return false
        }
      },
      onClick: ([{ id, name, type, scope }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Service' }),
            entityValue: name
          },
          onOk: () => {
            if (scope > 0) {
              showToast({
                type: 'error',
                content: $t({
                  defaultMessage: 'This profile is used in Network, it is not allowed to be deleted'
                })
              })
            } else {
              const [ deleteFn ] = deleteServiceFnMapping[type]
              deleteFn({ params: { tenantId, serviceId: id } }).then(clearSelection)
            }
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => {
        const hasScope = _.find(selectedRows,
          (o)=> {return o.scope!==0 && o.type === ServiceType.DHCP} )
        if(_.isEmpty(hasScope)){
          return true
        }else{
          return false
        }
      },
      onClick: ([{ type, id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: type as ServiceType,
            oper: ServiceOperation.EDIT,
            serviceId: id
          })
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'Services ({serviceCount})'
          },
          {
            serviceCount: tableQuery.data?.totalCount
          })
        }
        extra={[
          <TenantLink to={getSelectServiceRoutePath(true)} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Service' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[tableQuery]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
