import { useCallback, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal }        from '@acx-ui/components'
import { baseUrlFor }                                                            from '@acx-ui/config'
import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { PortalPreviewModal, SimpleListTooltip, getLanguage, initialPortalData } from '@acx-ui/rc/components'
import {
  useDeletePortalMutation,
  useGetEnhancedPortalProfileListQuery,
  useWifiNetworkListQuery,
  useLazyGetPortalQuery,
  useGetPortalLangMutation
} from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  useConfigTemplate,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  Portal,
  PortalLanguageEnum,
  Demo,
  PORTAL_LIMIT_NUMBER,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  getServiceAllowedOperation,
  useServicesBreadcrumb
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { getImageDownloadUrl }                                     from '@acx-ui/utils'

const Photo = baseUrlFor('/assets/images/portal/PortalPhoto.jpg')
const Powered = baseUrlFor('/assets/images/portal/PoweredLogo.png')
const Logo = baseUrlFor('/assets/images/portal/RuckusCloud.png')

export default function PortalTable (props: { hideHeader?: boolean }) {
  const intl = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isNewDefined = isTemplate || isEnabledRbacService
  const tenantBasePath: Path = useTenantLink('')
  const [ deletePortal ] = useDeletePortalMutation()
  const [getPortalLang] = useGetPortalLangMutation()
  const [getPortal] = useLazyGetPortalQuery()
  const [portalLang, setPortalLang]=useState({} as { [key:string]:string })
  const [newDemo, setNewDemo]=useState({} as Demo)

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedPortalProfileListQuery,
    defaultPayload: {
      filters: {}
    },
    enableRbac: isEnabledRbacService,
    search: {
      searchTargetFields: [isEnabledRbacService? 'name' : 'serviceName'],
      searchString: ''
    }
  })

  const resetDemo = useCallback(() => {
    setNewDemo({} as Demo)
    setPortalLang({})
  }, [setNewDemo, setPortalLang])

  const rowActions: TableProps<Portal>['rowActions'] = [
    {
      rbacOpsIds: getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.DELETE),
      label: intl.$t({ defaultMessage: 'Delete' }),
      scopeKey: getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.DELETE),
      onClick: ([{ id, serviceName, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: intl.$t({ defaultMessage: 'Portal Service' }),
            entityValue: serviceName || name
          },
          onOk: () => {
            deletePortal({ params: { serviceId: id } }).then(clearSelection)
          }
        })
      }
    },
    {
      rbacOpsIds: getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.EDIT),
      label: intl.$t({ defaultMessage: 'Edit' }),
      scopeKey: getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.EDIT),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.PORTAL,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]
  const emptyNetworks: { key: string, value: string }[] = []
  const { networkNameMap } = useWifiNetworkListQuery({
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
        : emptyNetworks
    })
  })
  const columns: TableProps<Portal>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.serviceName ?? row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'language',
      title: intl.$t({ defaultMessage: 'Language' }),
      dataIndex: 'language',
      render: (_, row) =>{
        if (isNewDefined) {
          return getLanguage((row?.displayLangCode||'en')as keyof typeof PortalLanguageEnum )
        }
        return getLanguage((row.content?.displayLangCode||'en')as keyof typeof PortalLanguageEnum )
      }
    },
    {
      key: 'demo',
      title: intl.$t({ defaultMessage: 'Preview' }),
      dataIndex: 'demo',
      align: 'center',
      render: (_, row) =>{
        return (
          <PortalPreviewModal
            key={row.id}
            demoValue={newDemo}
            portalLang={portalLang}
            fromPortalList={true}
            onPreviewClick={async () => {
              const portalData = await getPortal({
                params: { serviceId: row.id as string },
                enableRbac: isEnabledRbacService }).unwrap() as Portal
              const demoValue = portalData.content as Demo
              const initDemo = { ...initialPortalData.content, ...demoValue } as Demo
              const tempDemo = { ...initDemo,
                poweredImg: demoValue.poweredImg?
                  await getImageDownloadUrl(isEnabledRbacService, demoValue.poweredImg):Powered,
                logo: demoValue.logo?
                  await getImageDownloadUrl(isEnabledRbacService, demoValue.logo):Logo,
                photo: demoValue.photo?
                  await getImageDownloadUrl(isEnabledRbacService, demoValue.photo): Photo,
                bgImage: demoValue.bgImage?
                  await getImageDownloadUrl(isEnabledRbacService, demoValue.bgImage):'' }
              setNewDemo(tempDemo)
              getPortalLang({ params: { ...params, messageName:
                tempDemo.displayLangCode+'.json' } }).unwrap().then(res=>{
                setPortalLang(res)
              })
            }}
            resetDemo={resetDemo}/>
        )
      }
    },
    {
      key: isNewDefined ? 'wifiNetworkIds' : 'networkIds',
      title: intl.$t({ defaultMessage: 'Networks' }),
      dataIndex: isNewDefined ? 'wifiNetworkIds' : 'networkIds',
      align: 'center',
      filterable: networkNameMap,
      render: (_,row) =>{
        const networkIds = isNewDefined ? row.wifiNetworkIds : row.networkIds
        if (!networkIds || networkIds.length === 0) return 0
        // eslint-disable-next-line max-len
        const tooltipItems = networkNameMap.filter(v => networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={networkIds.length} />
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)
  const breadcrumb = useServicesBreadcrumb()

  return (
    <>
      { props.hideHeader !== true && <PageHeader
        title={
          // eslint-disable-next-line max-len
          intl.$t({ defaultMessage: 'Guest Portal ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            rbacOpsIds={getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.CREATE)}
            to={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })}
            scopeKey={getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.CREATE)}
          >
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= PORTAL_LIMIT_NUMBER
                : false} >{intl.$t({ defaultMessage: 'Add Guest Portal' })}</Button>
          </TenantLink>
        ])}
      />}
      <Loader states={[tableQuery]}>
        <Table<Portal>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}
