import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }         from '@acx-ui/components'
import {
  useGetEdgeSdLanP2Query,
  useUpdateEdgeSdLanPartialMutation
} from '@acx-ui/rc/services'
import {
  EdgeSdLanSettingP2,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import EdgeSdLanForm, { EdgeSdLanFormModelP2 } from '../EdgeSdLanForm'
import { SettingsForm }                        from '../EdgeSdLanForm/SettingsForm'
import { TunnelScopeForm }                     from '../EdgeSdLanForm/TunnelScopeForm'

const EditEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN_P2,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(cfListRoute)
  const [updateEdgeSdLan] = useUpdateEdgeSdLanPartialMutation()
  const { data, isLoading } = useGetEdgeSdLanP2Query({ params })
  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <TunnelScopeForm />
    }
  ]

  const handleFinish = async (formData: EdgeSdLanFormModelP2) => {
    try {
      const payload = {
        name: formData.name,
        networkIds: formData.activatedNetworks.map(network => network.id),
        tunnelProfileId: formData.tunnelProfileId
      } as EdgeSdLanSettingP2

      // TODO: can change `isGuestEnabled` & `guestEdgeId`?
      if (formData.isGuestTunnelEnabled) {
        payload.guestTunnelProfileId = formData.guestTunnelProfileId
        payload.guestNetworkIds = formData.activatedGuestNetworks.map(network => network.id!)
      }

      await updateEdgeSdLan({ params, payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
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
      <Loader states={[{ isLoading }]}>
        <EdgeSdLanForm
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}

export default EditEdgeSdLan