import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCard,
  RadioCardCategory,
  StepsFormLegacy
} from '@acx-ui/components'
import {
  Features,
  TierFeatures,
  useIsSplitOn,
  useIsTierAllowed
} from '@acx-ui/feature-toggle'
import { IDENTITY_PROVIDER_MAX_COUNT, LBS_SERVER_PROFILE_MAX_COUNT, WIFI_OPERATOR_MAX_COUNT, useIsEdgeFeatureReady, useIsEdgeReady } from '@acx-ui/rc/components'
import {
  useGetApSnmpViewModelQuery,
  useGetIdentityProviderListQuery,
  useGetLbsServerProfileListQuery,
  useGetWifiOperatorListQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  isPolicyCardEnabled,
  policyTypeDescMapping,
  policyTypeLabelMapping
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes, WifiScopes }                    from '@acx-ui/types'
import { getUserProfile, hasPermission, isCoreTier }   from '@acx-ui/user'

export default function SelectPolicyForm () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const params = useParams()
  const navigate = useNavigate()
  const policiesTablePath: Path = useTenantLink(getPolicyListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isEdgeEnabled = useIsEdgeReady()
  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isWorkflowTierEnabled = useIsTierAllowed(Features.WORKFLOW_ONBOARD)
  const isWorkflowFFEnabled = useIsSplitOn(Features.WORKFLOW_TOGGLE) && !isCore
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEdgeQosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isIpsecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  const isLbsFeatureEnabled = useIsSplitOn(Features.WIFI_EDA_LBS_TOGGLE)
  const isLbsFeatureTierAllowed = useIsTierAllowed(TierFeatures.LOCATION_BASED_SERVICES)
  const supportLbs = isLbsFeatureEnabled && isLbsFeatureTierAllowed && !isCore
  const ApSnmpPolicyTotalCount = useGetApSnmpViewModelQuery({
    params,
    enableRbac: isUseRbacApi,
    isSNMPv3PassphraseOn,
    payload: {
      fields: ['id']
    }
  }).data?.totalCount || 0
  const WifiOperatorTotalCount = useGetWifiOperatorListQuery({
    params,
    payload: {
      fields: ['id']
    }
  }, { skip: !supportHotspot20R1 }).data?.totalCount || 0
  const IdentityProviderTotalCount = useGetIdentityProviderListQuery({
    params,
    payload: {
      fields: ['id']
    }
  }, { skip: !supportHotspot20R1 }).data?.totalCount || 0
  const LbsProfileTotalCount = useGetLbsServerProfileListQuery({
    params,
    payload: {
      fields: ['id']
    }
  }, { skip: !supportLbs }).data?.totalCount || 0
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  // eslint-disable-next-line max-len
  const isDirectoryServerEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_DIRECTORY_SERVER_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)
  const isCaptivePortalSsoSamlEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)

  const navigateToCreatePolicy = async function (data: { policyType: PolicyType }) {
    const policyCreatePath = getPolicyRoutePath({
      type: data.policyType,
      oper: PolicyOperation.CREATE
    })

    navigate({
      ...tenantBasePath,
      pathname: `${tenantBasePath.pathname}/${policyCreatePath}`
    })
  }

  const sets = [
    {
      type: PolicyType.ACCESS_CONTROL,
      categories: [RadioCardCategory.WIFI],
      disabled: isSwitchMacAclEnabled
    },
    {
      type: PolicyType.ACCESS_CONTROL_CONSOLIDATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
      disabled: !isSwitchMacAclEnabled
    },
    { type: PolicyType.VLAN_POOL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.ROGUE_AP_DETECTION, categories: [RadioCardCategory.WIFI], disabled: isCore },
    { type: PolicyType.AAA, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.SYSLOG, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.CLIENT_ISOLATION, categories: [RadioCardCategory.WIFI] },
    {
      type: PolicyType.SNMP_AGENT,
      categories: [RadioCardCategory.WIFI],
      disabled: (ApSnmpPolicyTotalCount >= 64)
    },
    {
      type: PolicyType.WIFI_OPERATOR,
      categories: [RadioCardCategory.WIFI],
      disabled: !supportHotspot20R1 || (WifiOperatorTotalCount >= WIFI_OPERATOR_MAX_COUNT)
    },
    {
      type: ((isCaptivePortalSsoSamlEnabled)? PolicyType.SAML_IDP : PolicyType.IDENTITY_PROVIDER),
      categories: [RadioCardCategory.WIFI],
      disabled: !supportHotspot20R1 || (IdentityProviderTotalCount >= IDENTITY_PROVIDER_MAX_COUNT)
    },
    {
      type: PolicyType.TUNNEL_PROFILE,
      categories: [RadioCardCategory.EDGE],
      disabled: !isEdgeEnabled
    },
    {
      type: PolicyType.MAC_REGISTRATION_LIST,
      categories: [RadioCardCategory.WIFI],
      disabled: !macRegistrationEnabled
    },
    {
      type: PolicyType.ADAPTIVE_POLICY,
      categories: [RadioCardCategory.WIFI],
      disabled: !cloudpathBetaEnabled
    },
    {
      type: PolicyType.LBS_SERVER_PROFILE,
      categories: [RadioCardCategory.WIFI],
      disabled: !supportLbs || (LbsProfileTotalCount >= LBS_SERVER_PROFILE_MAX_COUNT)
    },
    {
      type: PolicyType.CONNECTION_METERING,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      disabled: !isConnectionMeteringEnabled
    },
    {
      type: PolicyType.CERTIFICATE_TEMPLATE,
      categories: [RadioCardCategory.WIFI],
      disabled: !isCertificateTemplateEnabled
    },
    {
      type: PolicyType.ETHERNET_PORT_PROFILE,
      categories: [RadioCardCategory.WIFI],
      disabled: !isEthernetPortProfileEnabled || isSwitchPortProfileEnabled
    },
    {
      type: PolicyType.WORKFLOW,
      categories: [RadioCardCategory.WIFI],
      disabled: !isWorkflowFFEnabled || !isWorkflowTierEnabled
    },
    {
      type: PolicyType.SOFTGRE,
      categories: [RadioCardCategory.WIFI],
      disabled: !(isSoftGreEnabled && hasPermission({ scopes: [WifiScopes.CREATE] }))
    },
    {
      type: PolicyType.HQOS_BANDWIDTH,
      categories: [RadioCardCategory.EDGE],
      disabled: !isEdgeQosEnabled
    },
    {
      type: PolicyType.FLEX_AUTH,
      categories: [RadioCardCategory.SWITCH],
      disabled: !isSwitchFlexAuthEnabled
    },
    {
      type: PolicyType.DIRECTORY_SERVER,
      categories: [RadioCardCategory.WIFI],
      disabled: !(isDirectoryServerEnabled && hasPermission({ scopes: [WifiScopes.CREATE] }))
    },
    {
      type: PolicyType.PORT_PROFILE,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH],
      disabled: !(isSwitchPortProfileEnabled &&
        hasPermission({ scopes: [WifiScopes.CREATE, SwitchScopes.CREATE] }))
    },
    {
      type: PolicyType.IPSEC,
      categories: [RadioCardCategory.WIFI],
      disabled: !(isIpsecEnabled && hasPermission({ scopes: [WifiScopes.CREATE] }))
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Policy or Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
      />
      <StepsFormLegacy
        onCancel={() => navigate(policiesTablePath)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
      >
        <StepsFormLegacy.StepForm
          name='selectService'
          onFinish={(data) => navigateToCreatePolicy(data)}
        >
          <Form.Item
            name='policyType'
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <GridRow>
                {
                  // eslint-disable-next-line max-len
                  sets.filter(item => isPolicyCardEnabled(item, PolicyOperation.CREATE)).map(item => {
                    return <GridCol col={{ span: 6 }} key={item.type}>
                      <RadioCard
                        type={'radio'}
                        key={item.type}
                        value={item.type}
                        title={$t(policyTypeLabelMapping[item.type])}
                        description={$t(policyTypeDescMapping[item.type])}
                        categories={item.categories}
                      />
                    </GridCol>
                  })
                }
              </GridRow>
            </Radio.Group>
          </Form.Item>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
