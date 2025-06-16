import { useIntl } from 'react-intl'

import { Button, categoryMapping, PageHeader, RadioCardCategory, Tabs } from '@acx-ui/components'
import {
  ServiceType,
  ServiceOperation,
  getServiceRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  getServiceAllowedOperation,
  useServicesBreadcrumb,
  serviceTypeLabelMapping
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
        title={$t(serviceTypeLabelMapping[ServiceType.MDNS_PROXY_CONSOLIDATION])}
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

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeKey}>
      <Tabs.TabPane
        tab={$t(categoryMapping[RadioCardCategory.WIFI].text)}
        key={MdnsProxyConsolidationTabKey.WIFI}
      />
      <Tabs.TabPane
        tab={$t(categoryMapping[RadioCardCategory.EDGE].text)}
        key={MdnsProxyConsolidationTabKey.EDGE}
      />
    </Tabs>
  )
}
