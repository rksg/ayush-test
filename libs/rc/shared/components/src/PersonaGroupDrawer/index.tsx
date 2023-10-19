import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'


import { Drawer, showToast }                                         from '@acx-ui/components'
import { useAddPersonaGroupMutation, useUpdatePersonaGroupMutation } from '@acx-ui/rc/services'
import { PersonaGroup }                                              from '@acx-ui/rc/utils'

import { PersonaGroupForm } from '../PersonaGroupForm'



interface PersonaGroupDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: (result?: PersonaGroup) => void,
  data?: PersonaGroup
}

export function PersonaGroupDrawer (props: PersonaGroupDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { isEdit, data, visible, onClose } = props
  const [addPersonaGroup] = useAddPersonaGroupMutation()
  const [updatePersonaGroup] = useUpdatePersonaGroupMutation()

  const onFinish = async (contextData: PersonaGroup) => {
    try {
      const result = isEdit
        ? await handleEditPersonaGroup(contextData)
        : await handleAddPersonaGroup(contextData)

      showToast({
        type: 'success',
        content: $t({
          defaultMessage: 'Identity Group {name} was {isEdit, select, true {updated} other {added}}'
        },
        { name: contextData.name, isEdit }
        )
      })

      onClose(result)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddPersonaGroup = async (submittedData: PersonaGroup) => {
    return addPersonaGroup({ payload: { ...submittedData } }).unwrap()
  }

  const handleEditPersonaGroup = async (submittedData: PersonaGroup) => {
    if (!data) return

    const personaGroupKeys = ['name', 'description', 'macRegistrationPoolId', 'dpskPoolId'] as const
    const patchData = {}

    personaGroupKeys.forEach(key => {
      if (submittedData[key] !== data[key]) {
        Object.assign(patchData, { [key]: submittedData[key] })
      }
    })

    if (Object.keys(patchData).length === 0) return

    return updatePersonaGroup({ params: { groupId: data?.id }, payload: patchData }).unwrap()
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
        />
      }
      footer={footer}
    />
  )
}
