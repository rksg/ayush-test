import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, showToast }       from '@acx-ui/components'
import {
  useAddAdaptivePolicyMutation,
  useAddPolicyConditionsMutation
} from '@acx-ui/rc/services'

import { AdaptivePolicySettingForm } from '../../AdaptivePolicy/AdaptivePolicyForm/AdaptivePolicySettingForm'

interface AdaptivePolicyFormDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export function AdaptivePolicyFormDrawer (props: AdaptivePolicyFormDrawerProps) {
  const { $t } = useIntl()
  const { setVisible, visible } = props
  const [form] = Form.useForm()
  const [addAdaptivePolicy] = useAddAdaptivePolicyMutation()
  const [addConditions] = useAddPolicyConditionsMutation()

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const data = form.getFieldsValue()

      const policyPayload = {
        name: data.name,
        onMatchResponse: data.attributeGroupId
      }

      const { id: addedPolicyId } = await addAdaptivePolicy({
        params: { templateId: data.templateTypeId },
        payload: policyPayload
      }).unwrap()

      if(addedPolicyId) {
        for (let rule of data.evaluationRules) {
          await addConditions({
            params: { templateId: data.templateTypeId, policyId: addedPolicyId },
            payload: {
              ...rule,
              policyId: addedPolicyId
            }
          }).unwrap()
        }
      }
      showToast({
        type: 'success',
        content: $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'Policy {name} was added' },
          { name: data.name }
        )
      })
      onClose()
    } catch (error) {
      if (error instanceof Error){
        throw error
      }
    }
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const footer = (
    <Drawer.FormFooter
      onCancel={() => {
        onClose()
      }}
      buttonLabel={{
        save: $t({ defaultMessage: 'Add' })
      }}
      onSave={handleSubmit}
    />
  )

  const content = (
    <Form layout={'vertical'}
      form={form}>
      <AdaptivePolicySettingForm drawerMode={true}/>
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Adaptive Policy' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      width={600}
    />
  )
}
