import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }       from '@acx-ui/components'
import {
  CommonAsyncResponse
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'


import { PersonaGroupForm }      from './PersonaGroupForm'
import { usePersonaGroupAction } from './usePersonaGroupActions'

interface PersonaGroupDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: (result?: CommonAsyncResponse) => void,
  data?: PersonaGroup,
  requiredDpsk?: boolean
}

export function PersonaGroupDrawer (props: PersonaGroupDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { isEdit, data, visible, onClose, requiredDpsk } = props
  const { createPersonaGroupMutation, updatePersonaGroupMutation } = usePersonaGroupAction()

  const onFinish = async (contextData: PersonaGroup) => {
    try {
      const result = isEdit
        ? await handleEditPersonaGroup(contextData)
        : await handleAddPersonaGroup(contextData)

      onClose(result)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddPersonaGroup = async (submittedData: PersonaGroup) => {
    return new Promise<CommonAsyncResponse>(async (resolve) => {
      await createPersonaGroupMutation(submittedData, resolve)
    })
  }

  const handleEditPersonaGroup = async (submittedData: PersonaGroup) => {
    if (!data) return

    return updatePersonaGroupMutation(data.id, data, submittedData)
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      await onFinish(form.getFieldsValue())
    } catch (e) {
      return Promise.resolve()
    }
  }

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: isEdit
          ? $t({ defaultMessage: 'Apply' })
          : $t({ defaultMessage: 'Add' })
      }}
      onSave={onSave}
      onCancel={() => onClose()}
    />)

  return (
    <Drawer
      destroyOnClose={true}
      title={
        isEdit
          ? $t({ defaultMessage: 'Edit Identity Group' })
          : $t({ defaultMessage: 'Create Identity Group' })
      }
      width={'400px'}
      visible={visible}
      onClose={() => onClose()}
      children={
        <PersonaGroupForm
          form={form}
          defaultValue={data}
          requiredDpsk={requiredDpsk}
        />
      }
      footer={footer}
    />
  )
}
