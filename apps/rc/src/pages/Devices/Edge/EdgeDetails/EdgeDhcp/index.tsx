import { useEffect, useState } from 'react'

import { Form, Space, Switch }    from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

import Leases           from './Leases'
import ManageDhcpDrawer from './ManageDhcpDrawer'
import Pools            from './Pools'
import * as UI          from './styledComponents'

const useMockData = () => {
  const [data, setData] = useState(0)
  useEffect(() => {
    setData(2)
  }, [])
  return { data }
}

const EdgeDhcp = () => {

  const { data } = useMockData()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edge-details/dhcp`)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const tabs = {
    pools: {
      title: $t({ defaultMessage: 'Pools' }),
      content: <Pools />
    },
    leases: {
      title: $t({ defaultMessage: 'Leases ( {count} online )' }, { count: data }),
      content: <Leases />
    }
  }

  const tabBarExtraContent = {
    right:
    <Space size='large' align='baseline'>
      <Form.Item
        label={$t({ defaultMessage: 'DHCP Service state' })}
        children={
          <Switch />
        }
      />
      <UI.SettingIcon
        data-testid='setting-icon'
        onClick={()=> setDrawerVisible(true)}
      />
    </Space>
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <>
      <ManageDhcpDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
      />
      <Tabs
        onChange={onTabChange}
        defaultActiveKey='pools'
        activeKey={activeSubTab}
        tabBarExtraContent={tabBarExtraContent}
        type='card'
      >
        {Object.keys(tabs)
          .map((key) =>
            <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
              {tabs[key as keyof typeof tabs].content}
            </Tabs.TabPane>)}
      </Tabs>
    </>
  )
}

export default EdgeDhcp
