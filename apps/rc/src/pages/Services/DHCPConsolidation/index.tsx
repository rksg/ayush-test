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

import DHCPTable     from '../DHCP/DHCPTable/DHCPTable'
import EdgeDhcpTable from '../DHCP/Edge/DHCPTable'

export enum DHCPConsolidationTabKey {
  WIFI = 'wifi',
  EDGE = 'edge'
}

const tabs = {
  [DHCPConsolidationTabKey.WIFI]: () => <DHCPTable hideHeader={true} />,
  [DHCPConsolidationTabKey.EDGE]: () => <EdgeDhcpTable hideHeader={true} />
}

export default function DHCPConsolidation () {
  const { $t } = useIntl()
  const params = useParams()
  // eslint-disable-next-line max-len
  const activeTab = (params?.activeTab ?? DHCPConsolidationTabKey.WIFI) as DHCPConsolidationTabKey

  const Tab = tabs[activeTab as keyof typeof tabs]

  const getAddButton = () => {
    const targetType = activeTab === DHCPConsolidationTabKey.WIFI
      ? ServiceType.DHCP
      : ServiceType.EDGE_DHCP

    const targetText = activeTab === DHCPConsolidationTabKey.WIFI
      ? $t({ defaultMessage: 'Add DHCP for Wi-Fi' })
      : $t({ defaultMessage: 'Add DHCP for Edge' })

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
        title={$t(serviceTypeLabelMapping[ServiceType.DHCP_CONSOLIDATION])}
        breadcrumb={useServicesBreadcrumb()}
        extra={getAddButton()}
        footer={<ConsolidationTabs activeKey={activeTab} />}
      />
      { Tab && <Tab /> }
    </>
  )
}

function ConsolidationTabs ({ activeKey }: { activeKey: DHCPConsolidationTabKey }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('services/dhcpConsolidation/list')

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
        key={DHCPConsolidationTabKey.WIFI}
      />
      <Tabs.TabPane
        tab={$t(categoryMapping[RadioCardCategory.EDGE].text)}
        key={DHCPConsolidationTabKey.EDGE}
      />
    </Tabs>
  )
}
