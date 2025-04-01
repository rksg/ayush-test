

import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs } from '@acx-ui/components'
import { useIsSplitOn, Features }   from '@acx-ui/feature-toggle'
import {
  getPolicyListRoutePath,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyType,
  PolicyOperation,
  getPolicyRoutePath,
  IdentityProviderTabType,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RbacOpsIds, ScopeKeys }                        from '@acx-ui/types'

import IdentityProviderTable from './IdentityProviderTable/IdentityProviderTable'
import SamlIdpTable          from './SamlIdpTable'

interface IdentityProviderProps {
  currentTabType: IdentityProviderTabType
  }
const IdentityProvider = (props: IdentityProviderProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { currentTabType } = props
  const isCaptivePortalSsoSamlEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)

  const tabs: Record<IdentityProviderTabType, JSX.Element> = {
    [IdentityProviderTabType.SAML]: <SamlIdpTable />,
    [IdentityProviderTabType.Hotspot20]: <IdentityProviderTable />
  }

  const tabsPathMapping: Record<IdentityProviderTabType, Path> = {
    [IdentityProviderTabType.SAML]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.SAML_IDP,
      oper: PolicyOperation.LIST
    })),
    [IdentityProviderTabType.Hotspot20]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.IDENTITY_PROVIDER,
      oper: PolicyOperation.LIST
    }))
  }

  const buttonTextMapping: Record<IdentityProviderTabType, string> = {
    [IdentityProviderTabType.SAML]:
      $t({ defaultMessage: 'Add SAML IdP' }),
    [IdentityProviderTabType.Hotspot20]:
      $t({ defaultMessage: 'Add HS2.0 IdP' })
  }

  const buttonLinkMapping: Record<IdentityProviderTabType, string> = {
    [IdentityProviderTabType.SAML]:
      getPolicyRoutePath({ type: PolicyType.SAML_IDP, oper: PolicyOperation.CREATE }),
    [IdentityProviderTabType.Hotspot20]:
      getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })
  }

  const scopeKeyMapping: Record<IdentityProviderTabType, ScopeKeys> = {
    [IdentityProviderTabType.SAML]:
      getScopeKeyByPolicy(PolicyType.SAML_IDP, PolicyOperation.CREATE),
    [IdentityProviderTabType.Hotspot20]:
      getScopeKeyByPolicy(PolicyType.IDENTITY_PROVIDER, PolicyOperation.CREATE)
  }

  const rbacOpsIdMapping: Record<IdentityProviderTabType, RbacOpsIds | undefined> = {
    [IdentityProviderTabType.SAML]:
      getPolicyAllowedOperation(PolicyType.SAML_IDP, PolicyOperation.CREATE),
    [IdentityProviderTabType.Hotspot20]:
      getPolicyAllowedOperation(PolicyType.IDENTITY_PROVIDER, PolicyOperation.CREATE)
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as IdentityProviderTabType])
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Idnetity Provider' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={buttonLinkMapping[currentTabType]}
            scopeKey={scopeKeyMapping[currentTabType]}
            rbacOpsIds={rbacOpsIdMapping[currentTabType]}
          >
            <Button key='configure' type='primary'>{buttonTextMapping[currentTabType]}</Button>
          </TenantLink>
        ])}
      />
      <Tabs onChange={onTabChange} activeKey={currentTabType}>
        {isCaptivePortalSsoSamlEnabled &&
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'SAML' })}
            key={IdentityProviderTabType.SAML}
          >
          </Tabs.TabPane>
        }
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Hotspot 2.0' })}
          key={IdentityProviderTabType.Hotspot20}
        >
        </Tabs.TabPane>
      </Tabs>
      {tabs[currentTabType]}
    </>
  )
}

export default IdentityProvider
