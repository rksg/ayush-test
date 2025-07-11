import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }            from '@acx-ui/components'
import { useMdnsProxyConsolidationTotalCount } from '@acx-ui/rc/components'
import {
  ServiceType,
  ServiceOperation,
  getServiceRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  getServiceAllowedOperation,
  useServicesBreadcrumb,
  serviceTypeLabelWithCountMapping
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeMdnsProxyTable } from '../MdnsProxy/Edge/EdgeMdnsProxyTable'
import MdnsProxyTable         from '../MdnsProxy/MdnsProxyTable/MdnsProxyTable'

export enum MdnsProxyConsolidationTabKey {
  WIFI = 'wifi',
  EDGE = 'edge'
}

const tabs = {
  [MdnsProxyConsolidationTabKey.WIFI]: () => <MdnsProxyTable hideHeader={true} />,
  [MdnsProxyConsolidationTabKey.EDGE]: () => <EdgeMdnsProxyTable hideHeader={true} />
}

export default function MdnsProxyConsolidation () {
  const { $t } = useIntl()
  const params = useParams()
  // eslint-disable-next-line max-len
  const activeTab = (params?.activeTab ?? MdnsProxyConsolidationTabKey.WIFI) as MdnsProxyConsolidationTabKey

  const Tab = tabs[activeTab as keyof typeof tabs]

  const { data: countData } = useMdnsProxyConsolidationTotalCount()

  const getAddButton = () => {
    const targetType = activeTab === MdnsProxyConsolidationTabKey.WIFI
      ? ServiceType.MDNS_PROXY
      : ServiceType.EDGE_MDNS_PROXY

    const targetText = activeTab === MdnsProxyConsolidationTabKey.WIFI
      ? $t({ defaultMessage: 'Add mDNS Proxy for Wi-Fi' })
      : $t({ defaultMessage: 'Add mDNS Proxy for Edge' })

    return filterByAccessForServicePolicyMutation([
      <TenantLink
        scopeKey={getScopeKeyByService(targetType, ServiceOperation.CREATE)}
        rbacOpsIds={getServiceAllowedOperation(targetType, ServiceOperation.CREATE)}
        to={getServiceRoutePath({ type: targetType, oper: ServiceOperation.CREATE })}
      >
        <Button type='primary'>{targetText}</Button>
      </TenantLink>
    ])
  }

  return (
    <>
      <PageHeader
        title={
          $t(serviceTypeLabelWithCountMapping[ServiceType.MDNS_PROXY_CONSOLIDATION], {
            count: countData?.totalCount
          })
        }
        breadcrumb={useServicesBreadcrumb()}
        extra={getAddButton()}
        footer={<ConsolidationTabs activeKey={activeTab} />}
      />
      { Tab && <Tab /> }
    </>
  )
}

function ConsolidationTabs ({ activeKey }: { activeKey: MdnsProxyConsolidationTabKey }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('services/mdnsProxyConsolidation/list')
  const { data: countData } = useMdnsProxyConsolidationTotalCount()

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeKey}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wi-Fi ({count})' }, {
          count: countData?.mdnsProxyCount
        })}
        key={MdnsProxyConsolidationTabKey.WIFI}
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'RUCKUS Edge ({count})' }, {
          count: countData?.edgeMdnsProxyCount
        })}
        key={MdnsProxyConsolidationTabKey.EDGE}
      />
    </Tabs>
  )
}
