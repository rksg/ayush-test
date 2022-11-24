

import {
  Form,
  Input,
  Tooltip
} from 'antd'
import { useIntl } from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { URLRegExp }                  from '@acx-ui/rc/utils'

export function DomainsInput (props:{
  label?:string,
  name?:string,
  required?:boolean,
  toolTip?:string
}) {
  const { $t } = useIntl()
  return (
    <Form.Item
      name={['hostGuestConfig', props.name||'hostDomains']}
      label={<>
        {$t({ defaultMessage: '{labelValue}' },{ labelValue: props.label || 'Host Domains' })}
        <Tooltip title={$t({ defaultMessage: '{toolTip}' },{ toolTip: props.toolTip ||
          'Only hosts from these domains will be allowed to approve guest requests' })}
        placement='bottom'>
          <QuestionMarkCircleOutlined />
        </Tooltip>
      </>}
      rules={[
        { required: props.required },
        { validator: (_, value) => URLRegExp(value) }]
      }
      validateFirst
      hasFeedback
      children={
        <Input
          placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
        />
      }
    />
  )
}
