import { useIntl } from 'react-intl'

import { PageHeader }                                                                  from '@acx-ui/components'
import { useAddEdgeFirewallMutation }                                                  from '@acx-ui/rc/services'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                  from '@acx-ui/react-router-dom'

import FirewallForm, { FirewallFormEdge, FirewallFormModel } from '../FirewallForm'
import { ScopeForm }                                         from '../FirewallForm/ScopeForm'
import { SettingsForm }                                      from '../FirewallForm/SettingsForm'
import { SummaryForm }                                       from '../FirewallForm/SummaryForm'

const AddFirewall = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const firewallListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_FIREWALL,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(firewallListRoute)
  const [addEdgeFirewall] = useAddEdgeFirewallMutation()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <ScopeForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const handleFinish = async (formData: FirewallFormModel) => {
    try {
      const payload = {
        serviceName: formData.serviceName,
        // tags: formData.tags,
        edgeIds: formData.selectedEdges?.map((edge: FirewallFormEdge) => edge.serialNumber) ?? [],
        ddosRateLimitingEnabled: formData.ddosRateLimitingEnabled,
        ddosRateLimitingRules: formData.ddosRateLimitingRules,
        statefulAclEnabled: formData.statefulAclEnabled,
        statefulAcls: formData.statefulAcls
      }

      await addEdgeFirewall({ payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Firewall Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Firewall' }), link: firewallListRoute }
        ]}
      />
      <FirewallForm
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddFirewall
