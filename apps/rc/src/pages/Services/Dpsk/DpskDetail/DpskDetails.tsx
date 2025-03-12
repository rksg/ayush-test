import { useIntl }         from 'react-intl'
import { Path, useParams } from 'react-router-dom'

import { Button, PageHeader, Tabs }                               from '@acx-ui/components'
import { DpskOverview, DpskPassphraseManagement }                 from '@acx-ui/rc/components'
import { useGetDpskQuery, useGetEnhancedDpskPassphraseListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceDetailsLink,
  ServiceOperation,
  useServiceListBreadcrumb,
  getScopeKeyByService,
  filterDpskOperationsByPermission,
  getServiceAllowedOperation, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink, useNavigate } from '@acx-ui/react-router-dom'

import { dpskTabNameMapping } from './contentsMap'



const defaultSearch = {
  searchTargetFields: ['username', 'mac'],
  searchString: ''
}

const defaultSorter = {
  sortField: 'createdDate',
  sortOrder: 'DESC'
}

export default function DpskDetails () {
  const { tenantId, activeTab, serviceId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const breadcrumb = useServiceListBreadcrumb(ServiceType.DPSK)
  const { data: dpskDetail } = useGetDpskQuery({ params: { tenantId, serviceId } })
  const { activePassphraseCount } = useGetEnhancedDpskPassphraseListQuery({
    params: { tenantId, serviceId },
    payload: { filters: { status: ['ACTIVE'] }, page: 1, pageSize: 1 }
  }, {
    selectFromResult: ({ data }) => {
      return {
        activePassphraseCount: data?.totalCount
      }
    }
  })
  const settingsId = 'dpsk-passphrase-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedDpskPassphraseListQuery,
    sorter: defaultSorter,
    defaultPayload: {},
    search: defaultSearch,
    enableSelectAllPagesData: ['id'],
    pagination: { settingsId }
  })

  const tabsPathMapping: Record<DpskDetailsTabKey, Path> = {
    [DpskDetailsTabKey.OVERVIEW]: useTenantLink(getServiceDetailsLink({
      type: ServiceType.DPSK,
      oper: ServiceOperation.DETAIL,
      serviceId: serviceId!,
      activeTab: DpskDetailsTabKey.OVERVIEW
    })),
    [DpskDetailsTabKey.PASSPHRASE_MGMT]: useTenantLink(getServiceDetailsLink({
      type: ServiceType.DPSK,
      oper: ServiceOperation.DETAIL,
      serviceId: serviceId!,
      activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
    }))
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as DpskDetailsTabKey])
  }

  const getTabComp = (activeTab: DpskDetailsTabKey) => {
    if (activeTab === DpskDetailsTabKey.OVERVIEW) {
      return <DpskOverview data={dpskDetail} />
    }

    return <DpskPassphraseManagement
      serviceId={serviceId!}
      tableQuery={tableQuery}
    />
  }

  return (
    <>
      <PageHeader
        title={dpskDetail?.name}
        breadcrumb={breadcrumb}
        extra={filterDpskOperationsByPermission([
          <TenantLink
            rbacOpsIds={getServiceAllowedOperation(ServiceType.DPSK, ServiceOperation.EDIT)}
            to={getServiceDetailsLink({
              type: ServiceType.DPSK,
              oper: ServiceOperation.EDIT,
              serviceId: serviceId!
            })}
            scopeKey={getScopeKeyByService(ServiceType.DPSK, ServiceOperation.EDIT)}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
        footer={
          <Tabs onChange={onTabChange} activeKey={activeTab}>
            <Tabs.TabPane
              tab={$t(dpskTabNameMapping[DpskDetailsTabKey.OVERVIEW])}
              key={DpskDetailsTabKey.OVERVIEW}
            />
            <Tabs.TabPane
              // eslint-disable-next-line max-len
              tab={$t(dpskTabNameMapping[DpskDetailsTabKey.PASSPHRASE_MGMT], { activeCount: activePassphraseCount ?? 0 })}
              key={DpskDetailsTabKey.PASSPHRASE_MGMT}
            />
          </Tabs>
        }
      />
      { getTabComp(activeTab as DpskDetailsTabKey) }
    </>
  )
}
