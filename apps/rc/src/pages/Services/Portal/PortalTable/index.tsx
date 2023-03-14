import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
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
  PortalLanguageEnum,
  Demo,
  PORTAL_LIMIT_NUMBER
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'
import { loadImageWithJWT }                                        from '@acx-ui/utils'

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
  const [portalLang, setPortalLang]=useState({} as { [key:string]:string })
  const [portalId, setPortalId]=useState('')
  const [newDemo, setNewDemo]=useState({} as Demo)
  const tableQuery = useTableQuery({
    useQuery: useGetPortalProfileListQuery,
    defaultPayload: {

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
        return (<div aria-label={row.id}
          onClick={async (e)=>{
            const demoValue = row.content
            const tempDemo = { ...demoValue, poweredImg: demoValue.poweredImg?
              await loadImageWithJWT(demoValue.poweredImg):Powered,
            logo: demoValue.logo?await loadImageWithJWT(demoValue.logo):Logo,
            photo: demoValue.photo?await loadImageWithJWT(demoValue.photo): Photo,
            bgImage: demoValue.bgImage?await loadImageWithJWT(demoValue.bgImage):'' }
            setNewDemo(tempDemo)
            getPortalLang({ params: { ...params, messageName:
              row.content.displayLangCode+'.json' } }).unwrap().then(res=>{
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
        />
      </Loader>
    </>
  )
}
