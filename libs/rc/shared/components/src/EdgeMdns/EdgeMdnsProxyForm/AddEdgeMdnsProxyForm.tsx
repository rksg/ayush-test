
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'

import { ScopeForm }    from './ScopeForm'
import { SettingsForm } from './SettingsForm'
import { SummaryForm }  from './SummaryForm'

import { EdgeMdnsProxyForm } from './'

export const AddEdgeMdnsProxyForm = (props: {
  onFinish: (formData: EdgeMdnsProxyViewData) => Promise<void>,
  onCancel: () => void
 }) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const steps = [{
    title: $t({ defaultMessage: 'Settings' }),
    content: SettingsForm
  }, {
    title: $t({ defaultMessage: 'Scope' }),
    content: ScopeForm
  }, {
    title: $t({ defaultMessage: 'Summary' }),
    content: SummaryForm
  }]

  return <EdgeMdnsProxyForm
    form={form}
    steps={steps}
    onFinish={props.onFinish}
    onCancel={props.onCancel}
  />
}