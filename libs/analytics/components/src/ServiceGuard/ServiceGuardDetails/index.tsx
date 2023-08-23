import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader, Tabs }                                    from '@acx-ui/components'
import { generatePath, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { Details }                                     from './DetailsTable'
import { Title, SubTitle, ReRunButton, TestRunButton } from './Header'
import { Overview }                                    from './Overview'

type ServiceGuardTabs = 'overview' | 'details' | 'progress'

const tabs : {
  key: ServiceGuardTabs,
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

const rootPath = '/analytics/serviceValidation'

export function ServiceGuardDetails () {
  const { $t } = useIntl()
  const { activeTab = tabs[0].key, ...ids } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(generatePath(`${rootPath}/:specId/tests/:testId/tab`, ids))

  const onTabChange = (tab: string) => navigate({
    ...basePath,
    pathname: `${basePath.pathname}/${tab}`
  })
  const Tab = tabs.find(tab => tab.key === activeTab)?.component

  return (
    <>
      <PageHeader
        title={<Title />}
        subTitle={<SubTitle />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Assurance' }) },
          { text: $t({ defaultMessage: 'Network Assurance' }) },
          {
            text: $t({ defaultMessage: 'Service Validation' }),
            link: '/analytics/serviceValidation'
          }
        ]}
        extra={[
          <ReRunButton key='re-run' />,
          <TestRunButton key='past-tests' />
        ]}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {tabs.map(({ key, title }) => <Tabs.TabPane tab={$t(title)} key={key} />)}
          </Tabs>
        }
      />
      {Tab && <Tab />}
    </>
  )
}
