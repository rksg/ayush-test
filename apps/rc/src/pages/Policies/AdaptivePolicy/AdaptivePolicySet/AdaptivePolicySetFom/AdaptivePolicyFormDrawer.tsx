import { Form }        from 'antd'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Drawer, showToast }             from '@acx-ui/components'
import {
  useAddAdaptivePolicyMutation,
  useAddPolicyConditionsMutation,
  useLazyAdaptivePolicyLisByQueryQuery
} from '@acx-ui/rc/services'
import { AccessCondition, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                    from '@acx-ui/react-router-dom'

import { AdaptivePolicySettingForm } from '../../AdaptivePolicy/AdaptivePolicyForm/AdaptivePolicySettingForm'

interface AdaptivePolicyFormDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export function AdaptivePolicyFormDrawer (props: AdaptivePolicyFormDrawerProps) {
  const { $t } = useIntl()
  const { setVisible, visible } = props
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [addAdaptivePolicy] = useAddAdaptivePolicyMutation()
  const [addConditions] = useAddPolicyConditionsMutation()

  const [policyList] = useLazyAdaptivePolicyLisByQueryQuery()

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const data = form.getFieldsValue()
      const policyPayload = {
        name: data.name,
        onMatchResponse: data.attributeGroupId
      }
      await addAdaptivePolicy({
        params: { templateId: data.templateTypeId },
        payload: policyPayload
      }).unwrap()

      // const policies = (await policyList({
      //   params: {
      //     excludeContent: 'false'
      //   },
      //   payload: {
      //     fields: [ 'name' ],
      //     page: 1, pageSize: 10,
      //     filters: { name: policyPayload.name }
      //   }
      // }).unwrap()).data.map(n => ({ id: n.id }))
      //
      // if(policies.length > 0) {
      //   data.evaluationRules.forEach((rule: AccessCondition) => {
      //     // console.log(rule)
      //     addConditions({
      //       params: { templateId: data.templateTypeId },
      //       payload: {
      //         ...rule,
      //         policyId: policies[0]
      //       }
      //     }).unwrap()
      //   })
      // }
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
