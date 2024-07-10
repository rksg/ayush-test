import { Form }      from 'antd'
import { transform } from 'lodash'
import { useIntl }   from 'react-intl'

import { PageHeader }                                                                                                            from '@acx-ui/components'
import { useEdgeSdLanActions }                                                                                                   from '@acx-ui/rc/components'
import { EdgeMvSdLanExtended, EdgeMvSdLanNetworks, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                                                            from '@acx-ui/react-router-dom'

import EdgeMvSdLanForm, { EdgeMvSdLanFormModel } from '../Form'
import { SettingsForm }                          from '../Form/SettingsForm'
import { SummaryForm }                           from '../Form/SummaryForm'
import { TunnelNetworkForm }                     from '../Form/TunnelNetworkForm'

const AddEdgeMvSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()

  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(cfListRoute)
  const { addEdgeSdLan } = useEdgeSdLanActions()

  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Tunnel & Network' }),
      content: <TunnelNetworkForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const handleFinish = async (formData: EdgeMvSdLanFormModel) => {
    try {
      const payload = {
        name: formData.name,
        venueId: formData.venueId,
        edgeClusterId: formData.edgeClusterId,
        networks: transform(formData.activatedNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks),
        tunnelProfileId: formData.tunnelProfileId,
        isGuestTunnelEnabled: formData.isGuestTunnelEnabled
      } as EdgeMvSdLanExtended

      if (formData.isGuestTunnelEnabled) {
        payload.guestEdgeClusterId = formData.guestEdgeClusterId
        payload.guestTunnelProfileId = formData.guestTunnelProfileId
        payload.guestNetworks = transform(formData.activatedGuestNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks),
      }

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

            navigate(linkToServiceList, { replace: true })
          }
        // need to catch basic service profile failed
        }).catch(reject)
      })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
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
      <EdgeMvSdLanForm
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddEdgeMvSdLan