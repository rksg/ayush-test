import { useEffect, useState } from 'react'

import { Tabs } from 'antd'

import { useNetworkDetailHeaderQuery }           from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function NetworkTabs () {
  const params = useParams()
  const [ apsCount, setApsCount ] = useState(0)
  const [ venuesCount, setVenuesCount ] = useState(0)
  const [ servicesCount, setServicesCount ] = useState(0)
  const basePath = useTenantLink(`/networks/${params.networkId}/network-details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const { data } = useNetworkDetailHeaderQuery({ params })

  useEffect(()=>{
    if (data) {
      const source = JSON.parse(JSON.stringify(data))
      setVenuesCount(source.activeVenueCount)
      setApsCount(source.aps.totalApCount)
    }
  }, [data])
  
  return (
    <Tabs onChange={onTabChange} activeKey={params.networkId}>
      <Tabs.TabPane tab='Overview' key='overview' />
      <Tabs.TabPane tab={`APs (${apsCount})`} key='aps' />
      <Tabs.TabPane tab={`Venues (${venuesCount})`} key='venues' />
      <Tabs.TabPane tab={`Services (${servicesCount})`} key='services' />
      <Tabs.TabPane tab='Events' key='events' />
      <Tabs.TabPane tab='Incidents' key='incidents' />
    </Tabs>
  )
}

export default NetworkTabs
