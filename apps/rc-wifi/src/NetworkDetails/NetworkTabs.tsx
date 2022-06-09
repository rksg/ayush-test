import { useEffect, useState } from 'react'

import { Tabs } from 'antd'
import styled   from 'styled-components/macro'

import { useNetworkDetailHeaderQuery }           from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const Wrapper = styled.div`
 .ant-tabs-tab + .ant-tabs-tab {
  margin-left: 30px;
 }
`
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

  const tableQuery = useNetworkDetailHeaderQuery({ params })

  useEffect(()=>{
    if (tableQuery.data) {
      const source = JSON.parse(JSON.stringify(tableQuery.data))
      setVenuesCount(source.activeVenueCount)
      setApsCount(source.aps.totalApCount)
    }
  }, [tableQuery.data])
  
  return (
    <Wrapper>
      <Tabs onChange={onTabChange} activeKey={params.networkId}>
        <Tabs.TabPane tab='Overview' key='overview' />
        <Tabs.TabPane tab={`APs (${apsCount})`} key='aps' />
        <Tabs.TabPane tab={`Venues (${venuesCount})`} key='venues' />
        <Tabs.TabPane tab={`Services (${servicesCount})`} key='services' />
        <Tabs.TabPane tab='Events' key='events' />
        <Tabs.TabPane tab='Incidents' key='incidents' />
      </Tabs>
    </Wrapper>
  )
}

export default NetworkTabs
