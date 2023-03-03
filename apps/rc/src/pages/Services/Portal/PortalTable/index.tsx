import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { hasAccesses }                                                    from '@acx-ui/rbac'
import { useDeletePortalMutation, useGetPortalProfileListQuery }          from '@acx-ui/rc/services'
import { useGetPortalLangMutation }                                       from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  Portal,
  PortalLanguageEnum
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'

import Photo              from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered            from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo               from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { getLanguage }    from '../../commonUtils'
import PortalPreviewModal from '../PortalPreviewModal'

export default function PortalTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deletePortal ] = useDeletePortalMutation()
  const [getPortalLang] = useGetPortalLangMutation()
  const PORTAL_LIMIT_NUMBER = 256
  const tableQuery = useTableQuery({
    useQuery: useGetPortalProfileListQuery,
    defaultPayload: {

    }
  })
  const params = useParams()
  const [portalLang, setPortalLang]=useState({} as { [key:string]:string })
  const [portalId, setPortalId]=useState('')
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

  const columns: TableProps<Portal>['columns'] = [
    {
      key: 'serviceName',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'language',
      title: intl.$t({ defaultMessage: 'Language' }),
      dataIndex: 'language',
      sorter: true,
      render: (data, row) =>{
        return getLanguage(row.content.displayLangCode as keyof typeof PortalLanguageEnum )
      }
    },
    {
      key: 'demo',
      title: intl.$t({ defaultMessage: 'Preview' }),
      dataIndex: 'demo',
      align: 'center',
      render: (data, row) =>{
        const demoValue = row.content
        const prefix = '/api/file/tenant/'+params.tenantId+'/'
        const newDemo = { ...demoValue, poweredImg: demoValue.poweredImg?
          (prefix+demoValue.poweredImg):Powered,
        logo: demoValue.logo?(prefix+demoValue.logo):Logo,
        photo: demoValue.photo?(prefix+demoValue.photo): Photo,
        bgImage: demoValue.bgImage?(prefix+demoValue.bgImage):'' }
        return <div aria-label={row.id}
          onClick={(e)=>{
            getPortalLang({ params: { ...params, messageName:
              row.content.displayLangCode+'.json' } }).unwrap().then(res=>{
              setPortalLang(res)
              setPortalId(row.id as string)
            })
            e.stopPropagation()
          }}><PortalPreviewModal
            demoValue={newDemo}
            portalLang={portalLang}
            id={row.id}
            portalId={portalId}
            fromPortalList={true}/></div>
      }
    },
    {
      key: 'networkCount',
      title: intl.$t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center'
    }
  ]

  return (
    <>
      <PageHeader
        title={
          // eslint-disable-next-line max-len
          intl.$t({ defaultMessage: 'Guest Portal ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={hasAccesses([
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
          rowActions={hasAccesses(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
