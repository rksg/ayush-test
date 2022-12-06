import React, { useEffect } from 'react'

import { Form }           from 'antd'
import { FormProvider }   from 'antd/lib/form/context'
import { FormFinishInfo } from 'rc-field-form/es/FormContext'
import { useIntl }        from 'react-intl'


import { Button, Drawer, showToast }                       from '@acx-ui/components'
import { useAddPersonaMutation, useUpdatePersonaMutation } from '@acx-ui/rc/services'
import { Persona }                                         from '@acx-ui/rc/utils'

import { PersonaForm } from '../PersonaForm'


interface PersonaDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: () => void,
  data?: Partial<Persona>
}


export function PersonaDrawer (props: PersonaDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { isEdit, data, visible, onClose } = props
  const [addPersona, addPersonaState] = useAddPersonaMutation()
  const [updatePersona, updatePersonaState] = useUpdatePersonaMutation()

  useEffect(()=> {
    // make sure that reset the form fields while close the Drawer
    if (!visible) {
      form.resetFields()
    }
  }, [visible])

  const triggerSubmit = () => form.submit()

  const onFormFinish = async (name: string, info: FormFinishInfo) => {
    const contextData: Persona = info.values as Persona

    try {
      isEdit
        ? await handleEditPersona(contextData)
        : await handleAddPersona(contextData)
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

  const handleAddPersona = async (submittedData: Persona) => {
    return addPersona({
      params: { groupId: submittedData.groupId },
      payload: { ...submittedData }
    }).unwrap()
  }

  const handleEditPersona = async (submittedData: Persona) => {
    if (!data) return

    const personaKeys = ['name', 'email', 'description', 'vlan'] as const
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

  const footer = [
    <div key={'footer'} style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
      <Button key='cancel' onClick={onClose} >
        { $t({ defaultMessage: 'Cancel' }) }
      </Button>
      <Button
        key='submit'
        type={'secondary'}
        onClick={triggerSubmit}
        loading={addPersonaState.isLoading || updatePersonaState.isLoading}
      >
        { isEdit
          ? $t({ defaultMessage: 'Apply' })
          : $t({ defaultMessage: 'Add' })
        }
      </Button>
    </div>
  ]

  return (
    <Drawer
      forceRender
      title={
        isEdit
          ? $t({ defaultMessage: 'Edit Persona' })
          : $t({ defaultMessage: 'Create Persona' })
      }
      width={'400px'}
      visible={visible}
      onClose={onClose}
      children={
        <FormProvider onFormFinish={onFormFinish}>
          <PersonaForm
            form={form}
            defaultValue={data}
          />
        </FormProvider>
      }
      footer={footer}
    />
  )
}
