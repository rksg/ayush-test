import { ReactNode, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader, Tabs }               from '@acx-ui/components'
import { useGetEdgeQuery }                        from '@acx-ui/rc/services'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                         from '@acx-ui/user'
import { getIntl }                                from '@acx-ui/utils'

import DnsServer       from './DnsServer'
import GeneralSettings from './GeneralSettings'
import Ports           from './Ports'
import StaticRoutes    from './StaticRoutes'

const { $t } = getIntl()

const tabs = {
  'general-settings': {
    title: $t({ defaultMessage: 'General Settings' }),
    content: <GeneralSettings />
  },
  'ports': {
    title: $t({ defaultMessage: 'Ports' }),
    content: <Ports />
  },
  'dns': {
    title: $t({ defaultMessage: 'DNS Server' }),
    content: <DnsServer />
  },
  'routes': {
    title: $t({ defaultMessage: 'Static Routes' }),
    content: <StaticRoutes />
  }
}

const EditEdgeTabs = () => {

  const navigate = useNavigate()
  const { activeTab, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit`)

  const onTabChange = (activeKey: string) => {
    if(activeKey === 'ports') activeKey = activeKey + '/ports-general'
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      {Object.keys(tabs)
        .map((key) => <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key} />)}
    </Tabs>
  )
}

const EditEdge = () => {

  const { $t } = useIntl()
  const { serialNumber, activeTab } = useParams()
  const { data: edgeInfoData } = useGetEdgeQuery({ params: { serialNumber: serialNumber } })
  const [activeTabContent, setActiveTabContent] = useState<ReactNode>()

  useEffect(() => {
    setActiveTabContent(tabs[activeTab as keyof typeof tabs].content)
  }, [activeTab])

  return (
    <>
      <PageHeader
        title={edgeInfoData?.name}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'SmartEdge' }),
            link: '/devices/edge/list'
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={`/devices/edge/${serialNumber}/edge-details/overview`}>
            <Button type='primary'>{ $t({ defaultMessage: 'Back to device details' }) }</Button>
          </TenantLink>
        ])}
        footer={<EditEdgeTabs />}
      />
      {activeTabContent}
    </>
  )
}

export default EditEdge
