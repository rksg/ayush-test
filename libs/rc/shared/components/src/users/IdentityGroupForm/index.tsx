import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormLegacy } from '@acx-ui/components'
import {
  CommonAsyncResponse
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'

import { usePersonaGroupAction } from '../PersonaGroupDrawer/usePersonaGroupActions'

import { IdentityGroupSettingForm } from './IdentityGroupSettingForm'

export function IdentityGroupForm ({ callback }: { callback: (identityGroupId?: string) => void }) {
  const { $t } = useIntl()
  const [ form ] = Form.useForm()
  const { createPersonaGroupMutation } = usePersonaGroupAction()

  const onFinish = async (contextData: PersonaGroup) => {
    try {
      const result = await handleAddPersonaGroup(contextData)
      callback(result.id)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddPersonaGroup = async (submittedData: PersonaGroup) => {
    return new Promise<CommonAsyncResponse>(async (resolve) => {
      await createPersonaGroupMutation(submittedData, resolve)
    })
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      await onFinish(form.getFieldsValue())
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <StepsFormLegacy
      editMode={false}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      onCancel={() => callback()}
      onFinish={onSave}>
      <StepsFormLegacy.StepForm>
        <IdentityGroupSettingForm
          form={form}
        />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
