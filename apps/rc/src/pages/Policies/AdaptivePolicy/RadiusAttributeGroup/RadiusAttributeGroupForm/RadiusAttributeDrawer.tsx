import React, { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }              from '@acx-ui/components'
import { AttributeAssignment } from '@acx-ui/rc/utils'

import { RadiusAttributeForm } from './RadiusAttributeForm'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit?: boolean
  editAttribute?: AttributeAssignment,
  setAttributeAssignments: (attribute: AttributeAssignment) => void
  getAttributeAssignments: () => AttributeAssignment []
}

export function RadiusAttributeDrawer (props: RadiusAttributeDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, isEdit, editAttribute, setAttributeAssignments, getAttributeAssignments } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)

  useEffect(() => {
    if (editAttribute && visible) {
      form.setFieldsValue(editAttribute)
    }
  }, [editAttribute, visible])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      const data = form.getFieldsValue()
      setAttributeAssignments(data)
      onClose()
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
    }
  }

  const footer = (
    <Drawer.FormFooter
      onCancel={resetFields}
      buttonLabel={{
        save: isEdit ? $t({ defaultMessage: 'Done' }) :
          $t({ defaultMessage: 'Add' })
      }}
      onSave={onSave}
    />
  )

  return (
    <Drawer
      title={isEdit ? $t({ defaultMessage: 'Edit RADIUS Attribute' }) :
        $t({ defaultMessage: 'Add RADIUS Attribute' })}
      visible={visible}
      onClose={onClose}
      children={<RadiusAttributeForm form={form}
        editAttribute={editAttribute}
        isEdit={isEdit}
        getAttributeAssignments={getAttributeAssignments}/>}
      footer={footer}
      destroyOnClose={resetField}
      width={600}
    />
  )
}
