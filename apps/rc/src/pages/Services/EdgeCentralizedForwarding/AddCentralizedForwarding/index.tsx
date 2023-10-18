import { useIntl } from 'react-intl'

import { PageHeader }                                                                  from '@acx-ui/components'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                  from '@acx-ui/react-router-dom'

import CentralizedForwardingForm, { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'
import { ScopeForm }                                                 from '../CentralizedForwardingForm/ScopeForm'
import { SettingsForm }                                              from '../CentralizedForwardingForm/SettingsForm'
import { SummaryForm }                                               from '../CentralizedForwardingForm/SummaryForm'


const AddEdgeCentralizedForwarding = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(cfListRoute)
  // TODO: waiting for API ready.
  // const [addEdgeCentralizedForwarding] = useAddEdgeCentralizedForwardingMutation()

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFinish = async (formData: CentralizedForwardingFormModel) => {
    try {
      // TODO: waiting for API ready.
      // const payload = {
      //   serviceName: formData.serviceName,
      //   venueId: formData.venueId,
      //   edgeId: formData.edgeId,
      //   corePort: formData.corePortId,
      //   networkIds: formData.activatedNetworks.map(network => network.id),
      //   tunnelProfileId: formData.tunnelProfileId
      // }
      // await addEdgeCentralizedForwarding({ payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Centralized Forwarding' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Centralized Forwarding' }), link: cfListRoute }
        ]}
      />
      <CentralizedForwardingForm
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddEdgeCentralizedForwarding