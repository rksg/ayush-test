
import { Form }    from 'antd'
import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm }                               from '@acx-ui/components'
import {
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithPolicySetMutation
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'

import { IdentityGroupSettingForm } from './IdentityGroupSettingForm'

export function IdentityGroupForm ({ callback }: { callback: (identityGroupId?: string) => void }) {
  const { $t } = useIntl()
  const [ form ] = Form.useForm<PersonaGroup>()
  const [ addPersonaGroup ] = useAddPersonaGroupMutation()
  const [ associatePolicySet ] = useAssociateIdentityGroupWithPolicySetMutation()

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const result = await addPersonaGroup({
        payload: omit(form.getFieldsValue(), ['policySetId'])
      }).unwrap()

      if (form.getFieldsValue().policySetId) {
        await associatePolicySet({
          params: { groupId: result.id, policySetId: form.getFieldsValue().policySetId }
        })
      }
      callback(result.id)
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <StepsForm
      editMode={false}
      form={form}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      onCancel={() => callback()}
      onFinish={handleSubmit}>
      <StepsForm.StepForm>
        <IdentityGroupSettingForm/>
      </StepsForm.StepForm>
    </StepsForm>
  )
}
