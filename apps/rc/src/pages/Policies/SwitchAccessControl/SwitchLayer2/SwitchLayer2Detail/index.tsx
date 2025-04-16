
import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }                          from '@acx-ui/components'
import { useGetLayer2AclByIdQuery }                          from '@acx-ui/rc/services'
import {  getPolicyListRoutePath, SwitchUrlsInfo }           from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                                      from '@acx-ui/types'
import { filterByAccess, hasCrossVenuesPermission }          from '@acx-ui/user'
import { getOpsApi }                                         from '@acx-ui/utils'

import Layer2ACLOverview from './Layer2ACLOverview'
import Layer2ACLRules    from './Layer2ACLRules'

const SwitchLayer2DetailTabs = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { accessControlId, activeTab } = useParams()
  const basePath = useTenantLink('/policies/accessControl/switch/layer2')

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${accessControlId}/${tab}`
    }, { replace: false })
  }

  useEffect(() => {
    if (activeTab) {
      onTabChange(activeTab)
    }
  }, [activeTab])

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key='overview' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Rules' })}
        key='rules' />
    </Tabs>
  )
}

const tabs = {
  overview: () => <Layer2ACLOverview />,
  rules: () => <Layer2ACLRules />
}

export function SwitchLayer2Detail () {
  const { $t } = useIntl()
  const { accessControlId, activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const accessControlRoute = getPolicyListRoutePath(true) + '/accessControl/switch/layer2'
  const { data } = useGetLayer2AclByIdQuery({ params: { accessControlId } })

  const getConfigureButton = () => {
    return (
      <TenantLink
        scopeKey={[SwitchScopes.UPDATE]}
        rbacOpsIds={[getOpsApi(SwitchUrlsInfo.updateLayer2Acl)]}
        to={`/policies/accessControl/switch/layer2/${accessControlId}/edit`}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
      </TenantLink>
    )
  }

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Access Control' }),
            link: accessControlRoute
          }
        ]}

        extra={hasCrossVenuesPermission() && filterByAccess([getConfigureButton()])}
      />
      <SwitchLayer2DetailTabs />
      { Tab && <Tab /> }
    </>
  )
}
