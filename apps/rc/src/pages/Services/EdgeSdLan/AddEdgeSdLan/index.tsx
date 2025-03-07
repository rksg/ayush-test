import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                            from '@acx-ui/components'
import { edgeSdLanFormRequestPreProcess, useEdgeMvSdLanActions } from '@acx-ui/rc/components'
import {
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  EdgeMvSdLanFormModel
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFormContainer } from '../Form'
import { SettingsForm }           from '../Form/SettingsForm'
import { SummaryForm }            from '../Form/SummaryForm'
import { TunnelNetworkForm }      from '../Form/TunnelNetworkForm'

export const AddEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()

  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(cfListRoute)
  const { addEdgeSdLan } = useEdgeMvSdLanActions()

  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: SettingsForm
    },
    {
      title: $t({ defaultMessage: 'Tunnel & Network' }),
      content: TunnelNetworkForm
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: SummaryForm
    }
  ]

  const handleFinish = async (formData: EdgeMvSdLanFormModel) => {
    try {
      const payload = edgeSdLanFormRequestPreProcess(formData)

      await new Promise(async (resolve, reject) => {
        await addEdgeSdLan({
          payload,
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
            } else {
              reject(result)
            }
          }
        // need to catch basic service profile failed
        }).catch(reject)
      })

      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
      navigate(linkToServiceList, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add SD-LAN Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'SD-LAN' }), link: cfListRoute }
        ]}
      />
      <EdgeSdLanFormContainer
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}
