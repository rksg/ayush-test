import { Form }                            from 'antd'
import { cloneDeep, get, omit, pick, set } from 'lodash'
import { useIntl }                         from 'react-intl'

import { Loader, PageHeader, StepsFormGotoStepFn }               from '@acx-ui/components'
import { edgeSdLanFormRequestPreProcess, useEdgeMvSdLanActions } from '@acx-ui/rc/components'
import { useGetEdgeMvSdLanQuery }                                from '@acx-ui/rc/services'
import {
  EdgeMvSdLanExtended,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  EdgeMvSdLanFormModel } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFormContainer } from '../Form'
import { SettingsForm }           from '../Form/SettingsForm'
import { TunnelNetworkForm }      from '../Form/TunnelNetworkForm'

export const EditEdgeSdLan = () => {
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
  const { data, isLoading, isFetching } = useGetEdgeMvSdLanQuery({ params })

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: SettingsForm
    },
    {
      title: $t({ defaultMessage: 'Tunnel & Network' }),
      content: TunnelNetworkForm
    }
  ]

  const handleFinish = async (_: EdgeMvSdLanFormModel, gotoStep: StepsFormGotoStepFn) => {
    try {
      const formData = form.getFieldsValue(true) as EdgeMvSdLanFormModel
      if (formData.isGuestTunnelEnabled && !formData.guestTunnelProfileId) {
        gotoStep(1)
        return
      }

      const payload = {
        ...omit(edgeSdLanFormRequestPreProcess(formData), 'edgeClusterId'),
        id: params.serviceId,
        ...pick(formData, ['edgeClusterVenueId', 'guestEdgeClusterVenueId']), // for RBAC API
        ...(formData.isGuestTunnelEnabled
          ? {} : pick(data, ['guestEdgeClusterId', 'guestTunnelProfileId', 'guestNetworks']))
      } as EdgeMvSdLanExtended

      // for RBAC API
      const originData = cloneDeep(data)
      set(originData!, 'guestEdgeClusterVenueId', get(formData, 'originGuestEdgeClusterVenueId'))

      await new Promise(async (resolve, reject) => {
        await editEdgeSdLan(originData! as EdgeMvSdLanExtended, {
          payload,
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
              navigate(linkToServiceList, { replace: true })
            } else {
              reject(result)
            }
          }
          // need to catch basic service profile failed
        }).catch(reject)
      })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
      navigate(linkToServiceList, { replace: true })
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
      <Loader states={[{ isLoading, isFetching }]}>
        <EdgeSdLanFormContainer
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}
