import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, Tabs }                from '@acx-ui/components'
import { CommonOperation, Device, getUrl } from '@acx-ui/rc/utils'
import { useTenantLink }                   from '@acx-ui/react-router-dom'

const EditEdgeCluster = () => {
  const { $t } = useIntl()
  const { activeTab, clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(getUrl({
    feature: Device.EdgeCluster,
    oper: CommonOperation.Edit,
    params: { id: clusterId }
  }))

  const tabs = {
    'cluster-details': {
      title: $t({ defaultMessage: 'Cluster Details' }),
      content: <div children={'cluster-details'} />
    },
    'virtual-ip': {
      title: $t({ defaultMessage: 'Virtual IP' }),
      content: <div children={'virtual-ip'} />
    },
    'cluster-interface': {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      content: <div children={'cluster-interface'} />
    },
    'dhcp': {
      title: $t({ defaultMessage: 'DHCP' }),
      content: <div children={'dhcp'} />
    }
  }

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Configure {name}' }, { name: '' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge' }
        ]}
        footer={
          <Tabs onChange={onTabChange} activeKey={activeTab}>
            {
              Object.entries(tabs).map(([k, v]) =>
                (<Tabs.TabPane tab={v.title} key={k} />))
            }
          </Tabs>
        }
      />
      {tabs[activeTab as keyof typeof tabs]?.content}
    </>
  )
}

export default EditEdgeCluster