

import {
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import { Tooltip }           from '@acx-ui/components'
import { domainsNameRegExp } from '@acx-ui/rc/utils'

export function DomainsInput (props:{
  label?:string,
  name?:string,
  required?:boolean,
  toolTip?:string
}) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  return (
    <Form.Item
      name={['guestPortal','hostGuestConfig', props.name||'hostDomains']}
      label={<>
        {$t({ defaultMessage: 'Host Domains' })}
        <Tooltip.Question title={$t({ defaultMessage:
         'Only hosts from these domains will be allowed to approve guest requests' })}
        placement='bottom' />
      </>}
      rules={[
        { required: props.required },
        { validator: (_, value) => domainsNameRegExp(value, true) }]
      }
      validateFirst
      hasFeedback
      children={
        <Input onChange={(e)=>form.setFieldValue(['guestPortal','hostGuestConfig',
          props.name||'hostDomains'],e.target.value.split(','))}
        placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
        />
      }
    />
  )
}
