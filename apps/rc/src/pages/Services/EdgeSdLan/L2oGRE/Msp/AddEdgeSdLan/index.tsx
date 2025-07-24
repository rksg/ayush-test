import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                            from '@acx-ui/components'
import { ServiceType, useServiceListBreadcrumb } from '@acx-ui/rc/utils'

import { EdgeSdLanFormType }         from '../../Form'
import { EdgeSdLanFormMspContainer } from '../Form'
import { GeneralForm }               from '../Form/GeneralForm'

export const AddEdgeSdLan = () => {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'General' }),
      content: GeneralForm
    }
  ]

  const handleFinish = async (formData: EdgeSdLanFormType) => {}

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