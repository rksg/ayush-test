
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                                                             from '@acx-ui/components'
import { useEdgeSdLanActions }                                                    from '@acx-ui/edge/components'
import { ServiceType, useAfterServiceSaveRedirectPath, useServiceListBreadcrumb } from '@acx-ui/rc/utils'
import { useNavigate }                                                            from '@acx-ui/react-router-dom'

import { EdgeSdLanFormType }         from '../../Form'
import { transformToApiData }        from '../../shared/utils'
import { EdgeSdLanFormMspContainer } from '../Form'
import { CustomerSelectionForm }     from '../Form/CustomerSelectionForm'
import { ApplyTo, GeneralForm }      from '../Form/GeneralForm'
import { NetworkSelectionForm }      from '../Form/NetworkSelectionForm'
import { SummaryForm }               from '../Form/SummaryForm'

export const AddEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const redirectPathAfterSave = useAfterServiceSaveRedirectPath(ServiceType.EDGE_SD_LAN)
  const [form] = Form.useForm()
  Form.useWatch('applyTo', form) // for rerender
  const applyTo = form.getFieldValue('applyTo')
  const { createEdgeSdLan } = useEdgeSdLanActions()

  const steps = [
    {
      title: $t({ defaultMessage: 'General' }),
      content: GeneralForm
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Network Selection' }),
      content: NetworkSelectionForm
    },
    ...(applyTo?.includes(ApplyTo.MY_CUSTOMERS) ? [
      {
        title: $t({ defaultMessage: 'Select Customers' }),
        content: CustomerSelectionForm
      }
    ] : []),
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: SummaryForm
    }
  ]

  const handleFinish = async (formData: EdgeSdLanFormType) => {
    const payload = transformToApiData(formData)

    try {
      await new Promise(async (resolve, reject) => {
        await createEdgeSdLan({
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
        }, true).catch(reject)
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
      <EdgeSdLanFormMspContainer
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}