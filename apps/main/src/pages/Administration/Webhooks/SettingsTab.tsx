import { useState } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Button }            from '@acx-ui/components'
import { URLProtocolRegExp } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

// interface WebhookTabProps {
// treeData: TreeDataNode[]
// updateChecked: (checked: Key[]) => void
// }

const SettingsTab = () => {
  const { $t } = useIntl()
  //   const { treeData, updateChecked } = props
  const [testURLEnabled, setTestURLEnabled] = useState<boolean>(false)

  //   const onCheck = (checked: Key[]) => {
  //     const checkedChildren = checked.filter(key => !treeData.map(t => t.key).includes(key))
  //     updateChecked(checkedChildren)
  //   }

  return <><Form.Item
    validateFirst
    name='name'
    label={$t({ defaultMessage: 'Name' })}
    rules={[
      { required: true },
      { max: 255 },
      { whitespace: true }
    ]}
    children={<Input />}
  />
  <Form.Item
    validateFirst
    name='callbackUrl'
    label={$t({ defaultMessage: 'Webhook URL' })}
    rules={[
      { required: true },
      { validator: (_, value) => URLProtocolRegExp(value) }
    ]}
    // children={<Input type='url' />}
  >
    <UI.WebhookURLSpaceWrapper direction='horizontal'>
      <Input type='url' />
      <Button
        type='default'
        disabled={!testURLEnabled}
        onClick={() => {}}>
        {$t({ defaultMessage: 'Test' })}
      </Button>
    </UI.WebhookURLSpaceWrapper>
  </Form.Item>
  <Form.Item
    name='secret'
    label={$t({ defaultMessage: 'Secret' })}
    rules={[{ required: true }]}
    children={<Input.Password />}
  />
  <Form.Item
    name='payload'
    label={$t({ defaultMessage: 'Payload' })}
    rules={[{ required: true }]}
    children={<Select />}
  />
  {/* <Form.Item name='enabled' hidden children={<Input hidden />} />
  {webhook?.id &&<Form.Item name='id' hidden children={<Input hidden />} />} */}
  {/* <Form.Item><SendSampleIncident /></Form.Item> */}
  </>
}

export default SettingsTab
