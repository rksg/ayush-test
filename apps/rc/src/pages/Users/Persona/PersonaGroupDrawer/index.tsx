import React, { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'


import { Button, Drawer, showToast }                                 from '@acx-ui/components'
import { useAddPersonaGroupMutation, useUpdatePersonaGroupMutation } from '@acx-ui/rc/services'
import { PersonaGroup }                                              from '@acx-ui/rc/utils'

import { PersonaGroupForm } from '../PersonaGroupForm'



interface PersonaGroupDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: () => void,
  data?: PersonaGroup
}

export function PersonaGroupDrawer (props: PersonaGroupDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { isEdit, data, visible, onClose } = props
  const [addPersonaGroup, addPersonaGroupState] = useAddPersonaGroupMutation()
  const [updatePersonaGroup, updatePersonaGroupState] = useUpdatePersonaGroupMutation()

  useEffect(() => {
    // make sure that reset the form fields while close the Drawer
    if (!visible) {
      form.resetFields()
    }
  }, [visible])

  const triggerSubmit = () => form.submit()

  const onFinish = async (contextData: PersonaGroup) => {
    try {
      isEdit
        ? await handleEditPersonaGroup(contextData)
        : await handleAddPersonaGroup(contextData)
      onClose()
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(error)) }
      })
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

  const footer = [
    <div key={'footer'} style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
      <Button key='cancel' onClick={onClose}>
        { $t({ defaultMessage: 'Cancel' }) }
      </Button>
      <Button
        key='submit'
        type={'secondary'}
        onClick={triggerSubmit}
        loading={addPersonaGroupState.isLoading || updatePersonaGroupState.isLoading}
      >
        { isEdit
          ? $t({ defaultMessage: 'Apply' })
          : $t({ defaultMessage: 'Add' }) }
      </Button>
    </div>
  ]

  return (
    <Drawer
      forceRender
      title={
        isEdit
          ? $t({ defaultMessage: 'Edit Persona Group' })
          : $t({ defaultMessage: 'Create Persona Group' })
      }
      width={'400px'}
      visible={visible}
      onClose={onClose}
      children={
        <PersonaGroupForm
          form={form}
          defaultValue={data}
          onFinish={onFinish}
        />
      }
      footer={footer}
    />
  )
}
