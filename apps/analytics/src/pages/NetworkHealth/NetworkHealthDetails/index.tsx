import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { Details }  from './Details'
import { Overview } from './Overview'

type NetworkHealthTabs = 'overview' | 'details' | 'progress'

const tabs : {
  key: NetworkHealthTabs,
  title: MessageDescriptor,
  component: () => JSX.Element
}[] = [
  {
    key: 'overview',
    title: defineMessage({ defaultMessage: 'Overview' }),
    component: Overview
  },
  {
    key: 'details',
    title: defineMessage({ defaultMessage: 'Details' }),
    component: Details
  }
]

function NetworkHealthDetails () {
  const { $t } = useIntl()
  const { activeTab = tabs[0].key } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/serviceValidation/networkHealth/:id/tab') // replace :id with test id
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const Tab = tabs.find(tab => tab.key === activeTab)?.component
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Test' })}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Service Validation' }),
          link: '/serviceValidation'
        }, {
          text: $t({ defaultMessage: 'Network Health' }),
          link: '/serviceValidation/networkHealth'
        }]}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {tabs.map(({ key, title }) => <Tabs.TabPane tab={$t(title)} key={key} />)}
          </Tabs>
        }
      />
      {Tab && <Tab/>}
    </>
  )
}

export default NetworkHealthDetails
