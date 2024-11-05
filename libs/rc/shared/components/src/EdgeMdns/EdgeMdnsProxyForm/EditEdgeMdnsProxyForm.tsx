
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'

import { ScopeForm }    from './ScopeForm'
import { SettingsForm } from './SettingsForm'

import { EdgeMdnsProxyForm } from './'

export const EditEdgeMdnsProxyForm = (props: {
  editData: EdgeMdnsProxyViewData | undefined,
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
  }]

  return <EdgeMdnsProxyForm
    form={form}
    steps={steps}
    editData={props.editData}
    onFinish={props.onFinish}
    onCancel={props.onCancel}
  />
}