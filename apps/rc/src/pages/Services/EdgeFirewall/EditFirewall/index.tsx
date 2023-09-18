import { useIntl } from 'react-intl'

import { Loader, PageHeader }                                                          from '@acx-ui/components'
import { useGetEdgeFirewallQuery, useUpdateEdgeFirewallMutation }                      from '@acx-ui/rc/services'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                       from '@acx-ui/react-router-dom'

import FirewallForm, { FirewallFormEdge, FirewallFormModel } from '../FirewallForm'
import { ScopeForm }                                         from '../FirewallForm/ScopeForm'
import { SettingsForm }                                      from '../FirewallForm/SettingsForm'

const EditFirewall = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const firewallListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_FIREWALL,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(firewallListRoute)

  const { data, isLoading } = useGetEdgeFirewallQuery({ params })
  const [updateEdgeFirewall] = useUpdateEdgeFirewallMutation()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <ScopeForm />
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

      await updateEdgeFirewall({ params, payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Firewall Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Firewall' }), link: firewallListRoute }
        ]}
      />
      <Loader states={[{ isLoading: isLoading }]}>
        <FirewallForm
          steps={steps}
          onFinish={handleFinish}
          editMode
          editData={data}
        />
      </Loader>
    </>
  )
}

export default EditFirewall
