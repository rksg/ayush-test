import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                                                                      from '@acx-ui/components'
import { useEdgeSdLanActions }                                                                             from '@acx-ui/rc/components'
import { EdgeSdLanSettingP2, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                                      from '@acx-ui/react-router-dom'

import EdgeSdLanFormP2, { EdgeSdLanFormModelP2 } from '../EdgeSdLanForm'
import { SettingsForm }                          from '../EdgeSdLanForm/SettingsForm'
import { SummaryForm }                           from '../EdgeSdLanForm/SummaryForm'
import { TunnelScopeForm }                       from '../EdgeSdLanForm/TunnelScopeForm'


const AddEdgeSdLanP2 = () => {
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
      content: <TunnelScopeForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFinish = async (formData: EdgeSdLanFormModelP2) => {
    try {
      const payload = {
        name: formData.name,
        venueId: formData.venueId,
        clusterId: formData.clusterId,
        networkIds: formData.activatedNetworks.map(network => network.id),
        tunnelProfileId: formData.tunnelProfileId,
        isGuestTunnelEnabled: formData.isGuestTunnelEnabled
      } as EdgeSdLanSettingP2

      if (formData.isGuestTunnelEnabled) {
        payload.guestClusterId = formData.guestClusterId
        payload.guestTunnelProfileId = formData.guestTunnelProfileId
        payload.guestNetworkIds = formData.activatedGuestNetworks.map(network => network.id!)
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
      <EdgeSdLanFormP2
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddEdgeSdLanP2