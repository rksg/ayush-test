import { useParams } from 'react-router-dom'

import { Tabs }                       from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                    from '@acx-ui/utils'

const intl = getIntl()
const tabs = {
  ports: {
    title: intl.$t({ defaultMessage: 'Ports' }),
    content: null // TODO
  },
  dns: {
    title: intl.$t({ defaultMessage: 'DNS Server' }),
    content: null // TODO
  },
  routes: {
    title: intl.$t({ defaultMessage: 'Static Routes' }),
    content: null // TODO
  }
}

const Settings = () => {

  const navigate = useNavigate()
  const { activeSubTab, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit/settings`)

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='ports'
      activeKey={activeSubTab}
      type='card'
    >
      {Object.keys(tabs)
        .map((key) =>
          <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
            {tabs[key as keyof typeof tabs].content}
          </Tabs.TabPane>)}
    </Tabs>
  )
}

export default Settings