import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal }                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                             from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                                                  from '@acx-ui/rc/components'
import { useDeletePortalMutation, useGetEnhancedPortalProfileListQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import { useGetPortalLangMutation }                                                           from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  Portal,
  PortalLanguageEnum,
  Demo,
  PORTAL_LIMIT_NUMBER
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'
import { loadImageWithJWT }                                        from '@acx-ui/utils'

import Photo                 from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered               from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                  from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { getLanguage }       from '../../commonUtils'
import { initialPortalData } from '../PortalForm/PortalForm'
import PortalPreviewModal    from '../PortalPreviewModal'

export default function PortalTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deletePortal ] = useDeletePortalMutation()
  const [getPortalLang] = useGetPortalLangMutation()
  const [portalLang, setPortalLang]=useState({} as { [key:string]:string })
  const [portalId, setPortalId]=useState('')
  const [newDemo, setNewDemo]=useState({} as Demo)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedPortalProfileListQuery,
    defaultPayload: {
      filters: {}
    },
    search: {
      searchTargetFields: ['serviceName'],
      searchString: ''
    }
  })
  const params = useParams()
  const rowActions: TableProps<Portal>['rowActions'] = [
    {
      label: intl.$t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, serviceName }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: intl.$t({ defaultMessage: 'Portal Service' }),
            entityValue: serviceName
          },
          onOk: () => {
            deletePortal({ params: { serviceId: id } }).then(clearSelection)
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
            type: ServiceType.PORTAL,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]
  const emptyNetworks: { key: string, value: string }[] = []
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
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.serviceName}
          </TenantLink>
        )
      }
    },
    {
      key: 'language',
      title: intl.$t({ defaultMessage: 'Language' }),
      dataIndex: 'language',
      render: (data, row) =>{
        return getLanguage((row.content?.displayLangCode||'en')as keyof typeof PortalLanguageEnum )
      }
    },
    {
      key: 'demo',
      title: intl.$t({ defaultMessage: 'Preview' }),
      dataIndex: 'demo',
      align: 'center',
      render: (data, row) =>{
        return (<div aria-label={row.id}
          onClick={async (e)=>{
            const demoValue = { ...row.content }
            const tempDemo = { ...initialPortalData.content, ...demoValue,
              poweredImg: demoValue.poweredImg?
                await loadImageWithJWT(demoValue.poweredImg):Powered,
              logo: demoValue.logo?await loadImageWithJWT(demoValue.logo):Logo,
              photo: demoValue.photo?await loadImageWithJWT(demoValue.photo): Photo,
              bgImage: demoValue.bgImage?await loadImageWithJWT(demoValue.bgImage):'' }
            setNewDemo(tempDemo)
            getPortalLang({ params: { ...params, messageName:
              tempDemo.displayLangCode+'.json' } }).unwrap().then(res=>{
              setPortalId(row.id as string)
              setPortalLang(res)
            })
            e.stopPropagation()
          }}><PortalPreviewModal
            demoValue={newDemo}
            portalLang={portalLang}
            id={row.id}
            portalId={portalId}
            fromPortalList={true}/></div>
        )
      }
    },
    {
      key: 'networkIds',
      title: intl.$t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkNameMap,
      render: (data,row) =>{
        if (!row.networkIds || row.networkIds.length === 0) return 0
        const networkIds = row.networkIds
        // eslint-disable-next-line max-len
        const tooltipItems = networkNameMap.filter(v => networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={networkIds.length} />
      }
    }
  ]
  return (
    <>
      <PageHeader
        title={
          // eslint-disable-next-line max-len
          intl.$t({ defaultMessage: 'Guest Portal ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={isNavbarEnhanced ? [
          { text: intl.$t({ defaultMessage: 'Network Control' }) },
          {
            text: intl.$t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true)
          }
        ] : [{
          text: intl.$t({ defaultMessage: 'My Services' }),
          link: getServiceListRoutePath(true)
        }]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })}>
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= PORTAL_LIMIT_NUMBER
                : false} >{intl.$t({ defaultMessage: 'Add Guest Portal' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<Portal>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}
