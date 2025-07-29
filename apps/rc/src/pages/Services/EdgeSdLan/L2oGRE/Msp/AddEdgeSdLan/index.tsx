import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }                            from '@acx-ui/components'
import { ServiceType, useServiceListBreadcrumb } from '@acx-ui/rc/utils'

import { EdgeSdLanFormType }         from '../../Form'
import { EdgeSdLanFormMspContainer } from '../Form'
import { CustomerSelectionForm }     from '../Form/CustomerSelectionForm'
import { GeneralForm }               from '../Form/GeneralForm'
import { NetworkSelectionForm }      from '../Form/NetworkSelectionForm'
import { SummaryForm }               from '../Form/SummaryForm'

export const AddEdgeSdLan = () => {
  const { $t } = useIntl()
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
    {
      title: $t({ defaultMessage: 'Select Customers' }),
      content: CustomerSelectionForm
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: SummaryForm
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