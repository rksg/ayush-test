import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                        from '@acx-ui/components'
import { useEdgeSdLanActions, useIsEdgeDelegationPermitted } from '@acx-ui/edge/components'
import { Features }                                          from '@acx-ui/feature-toggle'
import {
  ServiceType,
  useAfterServiceSaveRedirectPath,
  useIsEdgeFeatureReady,
  useServiceListBreadcrumb
} from '@acx-ui/rc/utils'
import { useNavigate } from '@acx-ui/react-router-dom'

import { EdgeSdLanFormContainer, EdgeSdLanFormType } from '../Form'
import { GeneralForm }                               from '../Form/GeneralForm'
import { NetworkSelectionForm }                      from '../Form/NetworkSelectionForm'
import { NetworkTemplateSelectionForm }              from '../Form/NetworkTemplateSelectionForm'
import { SummaryForm }                               from '../Form/SummaryForm'

export const AddEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const isEdgeDelegationEnabled = useIsEdgeFeatureReady(Features.EDGE_DELEGATION_POC_TOGGLE)

  const redirectPathAfterSave = useAfterServiceSaveRedirectPath(ServiceType.EDGE_SD_LAN)
  const { createEdgeSdLan } = useEdgeSdLanActions()
  const isTemplateSupported = useIsEdgeDelegationPermitted()

  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'General' }),
      content: GeneralForm
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Network Selection' }),
      content: NetworkSelectionForm
    },
    ...isEdgeDelegationEnabled && isTemplateSupported ? [{
      title: $t({ defaultMessage: 'Wi-Fi Network Template Selection' }),
      content: NetworkTemplateSelectionForm
    }] : [],
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: SummaryForm
    }
  ]

  const handleFinish = async (formData: EdgeSdLanFormType) => {
    try {
      await new Promise(async (resolve, reject) => {
        await createEdgeSdLan({
          payload: {
            name: formData.name,
            tunnelProfileId: formData.tunnelProfileId,
            activeNetwork: Object.entries(formData.activatedNetworks)
              .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
                venueId,
                networkId,
                tunnelProfileId
              }))).flat(),
            activeNetworkTemplate: isTemplateSupported && formData.activatedNetworkTemplates
              ? Object.entries(formData.activatedNetworkTemplates)
                .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
                  venueId,
                  networkId,
                  tunnelProfileId
                }))).flat()
              : undefined
          },
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
            } else {
              reject(result)
            }
          }
        // need to catch basic service profile failed
        }, isTemplateSupported).catch(reject)
      })

      navigate(redirectPathAfterSave, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
      navigate(redirectPathAfterSave, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add SD-LAN Service' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.EDGE_SD_LAN)}
      />
      <EdgeSdLanFormContainer
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}
