import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader, Tabs }                                    from '@acx-ui/components'
import { generatePath, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { useNetworkHealthTest } from '../services'
import { NetworkHealthTest }    from '../types'

import { Details }                                     from './DetailsTable'
import { Title, SubTitle, ReRunButton, TestRunButton } from './Header'
import { Overview }                                    from './Overview'

type NetworkHealthTabs = 'overview' | 'details' | 'progress'

const tabs : {
  key: NetworkHealthTabs,
  title: MessageDescriptor,
  component: ({ details }: { details: NetworkHealthTest }) => JSX.Element
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

const rootPath = '/serviceValidation/networkHealth'

function NetworkHealthDetails () {
  const { $t } = useIntl()
  const { activeTab = tabs[0].key, ...ids } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(generatePath(`${rootPath}/:specId/tests/:testId/tab`, ids))
  const queryResults = useNetworkHealthTest()

  const onTabChange = (tab: string) => navigate({
    ...basePath,
    pathname: `${basePath.pathname}/${tab}`
  })
  const Tab = tabs.find(tab => tab.key === activeTab)?.component

  return (
    <>
      <PageHeader
        title={<Title queryResults={queryResults} />}
        subTitle={<SubTitle queryResults={queryResults} />}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Network Health' }),
          link: '/serviceValidation/networkHealth'
        }]}
        extra={[
          <ReRunButton/>,
          <TestRunButton/>
        ]}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {tabs.map(({ key, title }) => <Tabs.TabPane tab={$t(title)} key={key} />)}
          </Tabs>
        }
      />
      {Tab && <Tab details={queryResults.data as NetworkHealthTest}/>}
    </>
  )
}

export default NetworkHealthDetails
