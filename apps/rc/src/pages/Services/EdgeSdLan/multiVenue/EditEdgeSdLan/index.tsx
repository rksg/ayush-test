import { Form }      from 'antd'
import { transform } from 'lodash'
import { useIntl }   from 'react-intl'

import { Loader, PageHeader, StepsFormGotoStepFn } from '@acx-ui/components'
import { useEdgeMvSdLanActions }                   from '@acx-ui/rc/components'
import { useGetEdgeMvSdLanQuery }                  from '@acx-ui/rc/services'
import {
  EdgeMvSdLanExtended,
  EdgeMvSdLanNetworks,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import EdgeMvSdLanForm, { EdgeMvSdLanFormModel } from '../Form'
import { SettingsForm }                          from '../Form/SettingsForm'
import { TunnelNetworkForm }                     from '../Form/TunnelNetworkForm'

const EditEdgeMvSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const [form] = Form.useForm()
  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(cfListRoute)
  const { editEdgeSdLan } = useEdgeMvSdLanActions()
  const { data, isFetching } = useGetEdgeMvSdLanQuery({ params })

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <TunnelNetworkForm />
    }
  ]

  const handleFinish = async (formData: EdgeMvSdLanFormModel, gotoStep: StepsFormGotoStepFn) => {
    try {
      if (formData.isGuestTunnelEnabled && !formData.guestTunnelProfileId) {
        gotoStep(1)
        return
      }

      const payload = {
        id: params.serviceId,
        venueId: formData.venueId,
        name: formData.name,
        networks: transform(formData.activatedNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks),
        tunnelProfileId: formData.tunnelProfileId,
        isGuestTunnelEnabled: formData.isGuestTunnelEnabled,
        guestEdgeClusterId: formData.guestEdgeClusterId,
        guestTunnelProfileId: formData.guestTunnelProfileId,
        guestNetworks: transform(formData.activatedGuestNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks)
      } as EdgeMvSdLanExtended

      await new Promise(async (resolve, reject) => {
        await editEdgeSdLan(data! as EdgeMvSdLanExtended, {
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
        title={$t({ defaultMessage: 'Edit SD-LAN' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'SD-LAN' }), link: cfListRoute }
        ]}
      />
      <Loader states={[{ isLoading: isFetching }]}>
        <EdgeMvSdLanForm
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}

export default EditEdgeMvSdLan