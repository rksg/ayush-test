import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                                            from '@acx-ui/components'
import { CONFIG_TEMPLATE_BUNDLE_LIST_PATH, CONFIG_TEMPLATE_LIST_PATH } from '@acx-ui/rc/utils'
import { Path, useNavigate, useParams, useTenantLink }                 from '@acx-ui/react-router-dom'

import { ConfigTemplateBundleList } from './Bundles'
import { ConfigTemplateList }       from './Templates'

export enum ConfigTemplateTabKey {
  TEMPLATES = 'templates',
  BUNDLES = 'bundles'
}

const tabs = {
  templates: ConfigTemplateList,
  bundles: ConfigTemplateBundleList
}

export function ConfigTemplate () {
  const { activeTab } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const Tab = tabs[activeTab as keyof typeof tabs]

  const tabsPathMapping: Record<ConfigTemplateTabKey, Path> = {
    [ConfigTemplateTabKey.TEMPLATES]: useTenantLink(CONFIG_TEMPLATE_LIST_PATH, 'v'),
    [ConfigTemplateTabKey.BUNDLES]: useTenantLink(CONFIG_TEMPLATE_BUNDLE_LIST_PATH, 'v')
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as ConfigTemplateTabKey])
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Configuration Templates' })}
        footer={
          <Tabs onChange={onTabChange} activeKey={activeTab}>
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Templates' })}
              key={ConfigTemplateTabKey.TEMPLATES}
            />
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'Bundles' })}
              key={ConfigTemplateTabKey.BUNDLES}
            />
          </Tabs>
        }
      />
      { Tab && <Tab /> }
    </>
  )
}
