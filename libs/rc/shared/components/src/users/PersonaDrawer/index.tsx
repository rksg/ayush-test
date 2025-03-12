import React, { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'


import { Drawer }                                                               from '@acx-ui/components'
import { CommonAsyncResponse, useAddPersonaMutation, useUpdatePersonaMutation } from '@acx-ui/rc/services'
import { Persona }                                                              from '@acx-ui/rc/utils'

import { PersonaForm } from '../PersonaForm'


interface PersonaDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: (result?: CommonAsyncResponse) => void,
  data?: Partial<Persona>,
  disableAddDevices?: boolean
}


export function PersonaDrawer (props: PersonaDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { isEdit, data, visible, onClose, disableAddDevices } = props
  // FIXME: Add loading status on creating and updating
  const [addPersona] = useAddPersonaMutation()
  const [updatePersona] = useUpdatePersonaMutation()

  useEffect(()=> {
    // make sure that reset the form fields while close the Drawer
    if (!visible) {
      form.resetFields()
    }
  }, [visible])

  const onFinish = async (contextData: Persona) => {
    try {
      const result = isEdit
        ? await handleEditPersona(contextData)
        : await handleAddPersona(contextData)

      onClose(result)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddPersona = async (submittedData: Persona) => {
    return addPersona({
      params: { groupId: submittedData.groupId },
      payload: { ...submittedData }
    }).unwrap()
  }

  const handleEditPersona = async (submittedData: Persona) => {
    if (!data) return

    const personaKeys = ['name', 'email', 'description', 'vlan', 'phoneNumber'] as const
    const patchData = {}

    personaKeys.forEach(key => {
      if (submittedData[key] !== data[key]) {
        Object.assign(patchData, { [key]: submittedData[key] })
      }
    })

    if (Object.keys(patchData).length === 0) return

    return updatePersona({
      params: { groupId: submittedData.groupId, id: data?.id },
      payload: patchData
    }).unwrap()
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
      onCancel={onClose}
    />
  )

  return (
    <Drawer
      destroyOnClose={true}
      title={
        isEdit
          ? $t({ defaultMessage: 'Edit Identity' })
          : $t({ defaultMessage: 'Create Identity' })
      }
      width={'400px'}
      visible={visible}
      onClose={() => onClose()}
      children={
        <PersonaForm
          form={form}
          defaultValue={data}
          disableAddDevices={disableAddDevices}
        />
      }
      footer={footer}
    />
  )
}
