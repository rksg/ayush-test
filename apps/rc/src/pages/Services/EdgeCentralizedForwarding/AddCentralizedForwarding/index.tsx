import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                                                  from '@acx-ui/components'
import { useAddEdgeCentralizedForwardingMutation }                                     from '@acx-ui/rc/services'
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
  const [addEdgeCentralizedForwarding] = useAddEdgeCentralizedForwardingMutation()
  const [form] = Form.useForm()

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
      const payload = {
        name: formData.name,
        edgeId: formData.edgeId,
        corePortMac: formData.corePortMac,
        networkIds: formData.activatedNetworks.map(network => network.id),
        tunnelProfileId: formData.tunnelProfileId
      }
      await addEdgeCentralizedForwarding({ payload }).unwrap()
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
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddEdgeCentralizedForwarding