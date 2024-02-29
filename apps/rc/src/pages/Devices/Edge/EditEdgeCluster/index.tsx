import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, Tabs }                                   from '@acx-ui/components'
import { useGetEdgeClusterListForTableQuery, useGetEdgeClusterQuery } from '@acx-ui/rc/services'
import { CommonOperation, Device, getUrl }                            from '@acx-ui/rc/utils'
import { useTenantLink }                                              from '@acx-ui/react-router-dom'

import { ClusterDetails }  from './ClusterDetails'
import { EdgeClusterDhcp } from './EdgeClusterDhcp'
import { VirtualIp }       from './VirtualIp'


const EditEdgeCluster = () => {
  const { $t } = useIntl()
  const { activeTab, clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(getUrl({
    feature: Device.EdgeCluster,
    oper: CommonOperation.Edit,
    params: { id: clusterId }
  }))
  const {
    currentClusterStatus,
    isClusterStatusLoading
  } = useGetEdgeClusterListForTableQuery({ payload: {
    filters: { clusterId: [clusterId], isCluster: [true] }
  } },{
    selectFromResult: ({ data, isLoading }) => {
      return {
        currentClusterStatus: data?.data[0],
        isClusterStatusLoading: isLoading
      }
    }
  })
  const { data: currentCluster, isLoading: isClusterLoading } = useGetEdgeClusterQuery({
    params: {
      venueId: currentClusterStatus?.venueId,
      clusterId: clusterId
    }
  }, {
    skip: !currentClusterStatus?.venueId
  })

  const tabs = {
    'cluster-details': {
      title: $t({ defaultMessage: 'Cluster Details' }),
      content: <ClusterDetails
        currentClusterStatus={currentClusterStatus}
      />
    },
    'virtual-ip': {
      title: $t({ defaultMessage: 'Virtual IP' }),
      content: <VirtualIp
        currentCluster={currentClusterStatus}
        currentVipConfig={currentCluster?.virtualIpSettings}
      />
    },
    'cluster-interface': {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      content: <div children={'cluster-interface'} />
    },
    'dhcp': {
      title: $t({ defaultMessage: 'DHCP' }),
      content: <EdgeClusterDhcp />
    }
  }

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Loader states={[{ isLoading: isClusterStatusLoading || isClusterLoading }]}>
      <PageHeader
        title={$t({ defaultMessage: 'Configure {name}' }, { name: currentClusterStatus?.name })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'SmartEdges' }), link: '/devices/edge' }
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
    </Loader>
  )
}

export default EditEdgeCluster