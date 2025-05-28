import { useIntl }                from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { PendingAp }     from './PendingAp'
import { PendingSwitch } from './PendingSwitch'

const PendingAssets = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/pendingAssets')


  const tabs = {
    pendingAp: {
      title: $t({ defaultMessage: 'AP' }),
      content: <PendingAp />,
      visible: true
    },
    pendingSwitch: {
      title: $t({ defaultMessage: 'Switch' }),
      content: <PendingSwitch />,
      visible: true
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='pendingAp'
      type='card'
      onChange={onTabChange}
      activeKey={params.activeSubTab}
    >
      {
        Object.entries(tabs).map((item) =>
          item[1].visible &&
          <Tabs.TabPane
            key={item[0]}
            tab={item[1].title}
            children={item[1].content}
          />)
      }
    </Tabs>
  )
}

export default PendingAssets