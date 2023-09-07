import { useIntl }         from 'react-intl'
import { Path, useParams } from 'react-router-dom'

import { Button, PageHeader, Tabs }                               from '@acx-ui/components'
import { Features, useIsTierAllowed }                             from '@acx-ui/feature-toggle'
import { useDpskNewConfigFlowParams }                             from '@acx-ui/rc/components'
import { useGetDpskQuery, useGetEnhancedDpskPassphraseListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  NewDpskPassphrase,
  isActivePassphrase
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink, useNavigate } from '@acx-ui/react-router-dom'
import { filterByAccess }                         from '@acx-ui/user'

import { dpskTabNameMapping }   from './contentsMap'
import DpskOverview             from './DpskOverview'
import DpskPassphraseManagement from './DpskPassphraseManagement'

export default function DpskDetails () {
  const { tenantId, activeTab, serviceId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  // eslint-disable-next-line max-len
  const { data: dpskDetail } = useGetDpskQuery({ params: { tenantId, serviceId, ...dpskNewConfigFlowParams } })
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { activePassphraseCount } = useGetEnhancedDpskPassphraseListQuery({
    params: { tenantId, serviceId, ...dpskNewConfigFlowParams },
    payload: { filters: {}, page: 1, pageSize: 75000 }
  }, {
    selectFromResult: ({ data }) => {
      return {
        activePassphraseCount: data?.data.filter((passphrase: NewDpskPassphrase) => {
          return isActivePassphrase(passphrase, isCloudpathEnabled)
        }).length
      }
    }
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

    return <DpskPassphraseManagement />
  }

  return (
    <>
      <PageHeader
        title={dpskDetail?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'DPSK' }),
            link: getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccess([
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.DPSK,
              oper: ServiceOperation.EDIT,
              serviceId: serviceId!
            })}
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
