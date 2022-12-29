import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { Details }  from './Details'
import { Overview } from './Overview'
import { Progress } from './Progress'

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
  },
  {
    key: 'progress',
    title: defineMessage({ defaultMessage: 'Progress' }),
    component: Progress
  }
]

function NetworkHealthPage () {
  const { $t } = useIntl()
  const { activeTab = tabs[0].key } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/serviceValidation/networkHealth/tab')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const Tab = tabs.find(tab => tab.key === activeTab)?.component
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Network Health' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Service Validation' }),
            link: '/serviceValidation/networkHealth'
          }
        ]}
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

export { NetworkHealthPage }
