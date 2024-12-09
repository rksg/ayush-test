import { useRef } from 'react'

import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import {
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithPolicySetMutation
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'

import { IdentityGroupSettingForm } from './IdentityGroupSettingForm'

export function IdentityGroupForm ({ callback }: { callback: (identityGroupId?: string) => void }) {
  const { $t } = useIntl()
  const formRef = useRef<StepsFormLegacyInstance<PersonaGroup>>()
  const [ addPersonaGroup ] = useAddPersonaGroupMutation()
  const [ associatePolicySet ] = useAssociateIdentityGroupWithPolicySetMutation()

  const handleSubmit = async () => {
    try {
      await formRef.current?.validateFields()
      const result = await addPersonaGroup({
        payload: omit(formRef.current?.getFieldsValue(), ['policySetId'])
      }).unwrap()

      if (formRef.current?.getFieldsValue().policySetId) {
        await associatePolicySet({
          params: { groupId: result.id, policySetId: formRef.current?.getFieldsValue().policySetId }
        })
      }
      callback(result.id)
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <StepsFormLegacy
      editMode={false}
      formRef={formRef}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      onCancel={() => callback()}
      onFinish={handleSubmit}>
      <StepsFormLegacy.StepForm>
        <IdentityGroupSettingForm/>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
