import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                                                  from '@acx-ui/components'
import { useAddEdgeSdLanMutation }                                                     from '@acx-ui/rc/services'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                  from '@acx-ui/react-router-dom'

import EdgeSdLanForm, { EdgeSdLanFormModel } from '../EdgeSdLanForm'
import { ScopeForm }                         from '../EdgeSdLanForm/ScopeForm'
import { SettingsForm }                      from '../EdgeSdLanForm/SettingsForm'
import { SummaryForm }                       from '../EdgeSdLanForm/SummaryForm'


const AddEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()

  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(cfListRoute)
  const [addEdgeSdLan] = useAddEdgeSdLanMutation()
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
  const handleFinish = async (formData: EdgeSdLanFormModel) => {
    try {
      const payload = {
        name: formData.name,
        edgeId: formData.edgeId,
        corePortMac: formData.corePortMac,
        networkIds: formData.activatedNetworks.map(network => network.id),
        tunnelProfileId: formData.tunnelProfileId
      }

      await addEdgeSdLan({ payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add SD-LAN' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'SD-LAN' }), link: cfListRoute }
        ]}
      />
      <EdgeSdLanForm
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddEdgeSdLan