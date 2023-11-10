import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }                         from '@acx-ui/components'
import {
  useGetEdgeCentralizedForwardingQuery,
  useUpdateEdgeCentralizedForwardingPartialMutation
} from '@acx-ui/rc/services'
import {
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import CentralizedForwardingForm, { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'
import { ScopeForm }                                                 from '../CentralizedForwardingForm/ScopeForm'
import { SettingsForm }                                              from '../CentralizedForwardingForm/SettingsForm'

const EditEdgeCentralizedForwarding = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(cfListRoute)
  const [updateEdgeCentralizedForwarding] = useUpdateEdgeCentralizedForwardingPartialMutation()
  const { data, isLoading } = useGetEdgeCentralizedForwardingQuery({ params })
  const [form] = Form.useForm()

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

  const handleFinish = async (formData: CentralizedForwardingFormModel) => {
    try {
      const payload = {
        name: formData.name,
        networkIds: formData.activatedNetworks.map(network => network.id),
        tunnelProfileId: formData.tunnelProfileId
      }

      await updateEdgeCentralizedForwarding({ params, payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Centralized Forwarding' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Centralized Forwarding' }), link: cfListRoute }
        ]}
      />
      <Loader states={[{ isLoading }]}>
        <CentralizedForwardingForm
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}

export default EditEdgeCentralizedForwarding