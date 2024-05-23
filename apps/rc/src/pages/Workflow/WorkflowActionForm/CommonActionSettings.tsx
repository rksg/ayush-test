import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { useLazySearchActionsQuery } from '@acx-ui/rc/services'
import { checkObjectNotExists }      from '@acx-ui/rc/utils'


export function CommonActionSettings () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const actionId = Form.useWatch('actionId', form)

  const [ searchActions ] = useLazySearchActionsQuery()

  const nameValidator = async (name: string) => {
    try {
      const list = (await searchActions({
        payload: { name, page: 0, pageSize: 10000 }
      }).unwrap()).content
        .filter(a => a.actionId !== actionId)
        .map(a => ({ name: a.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Action' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  return <>
    <Form.Item
      name={'actionId'}
      noStyle
      children={<Input hidden />}
    />
    <Form.Item
      id='name'
      name={'name'}
      label={$t({ defaultMessage: 'Name' })}
      rules={[
        { required: true },
        { min: 2 },
        { max: 100 },
        { validator: (_, name) => nameValidator(name) }
      ]}
      validateTrigger={'onBlur'}
      hasFeedback
      validateFirst
    >
      <Input />
    </Form.Item>
    <Form.Item
      name={'description'}
      label={$t({ defaultMessage: 'Description' })}
      rules={[
        { max: 10000 }
      ]}
    >
      <Input.TextArea rows={8} />
    </Form.Item>
  </>
}
