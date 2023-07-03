import React, { useState } from 'react'

import { Form }         from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Drawer, showToast }                  from '@acx-ui/components'
import { useAddRadiusAttributeGroupMutation } from '@acx-ui/rc/services'
import { AttributeAssignment, OperatorType }  from '@acx-ui/rc/utils'

import {
  RadiusAttributeGroupSettingForm
} from '../../RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeGroupSettingForm'

import { RadiusAttributeDialog } from './RadiusAttributeDialog'

interface RadiusAttributeGroupFormDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export function RadiusAttributeGroupFormDrawer (props: RadiusAttributeGroupFormDrawerProps) {
  const { $t } = useIntl()
  const { setVisible, visible } = props
  const [form] = Form.useForm()
  const [attributeDialogVisible, setAttributeDialogVisible] = useState(false)
  const [editAttributeMode, setEditAttributeMode] = useState(false)
  const [addRadiusAttributeGroup] = useAddRadiusAttributeGroupMutation()
  const [editAttribute, setEditAttribute] = useState<AttributeAssignment>()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleAddGroup = async () =>{
    try {
      await form.validateFields()
      const submitData = form.getFieldsValue()
      const payload = {
        name: submitData.name,
        description: submitData.name,
        // eslint-disable-next-line max-len
        attributeAssignments: submitData.attributeAssignments.map((a:AttributeAssignment) => _.omit(a, 'id'))
      }
      await addRadiusAttributeGroup({ payload }).unwrap()

      showToast({
        type: 'success',
        content: $t(
          { defaultMessage: 'Group {name} was added' },
          { name: submitData.name }
        )
      })

      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const setAttributeAssignments = (attribute: AttributeAssignment) => {
    const attributeAssignments = form.getFieldValue('attributeAssignments')
    // eslint-disable-next-line max-len
    const newAttribute: AttributeAssignment[] = attributeAssignments ? attributeAssignments.slice() : []
    if (editAttributeMode) {
      const targetIdx = newAttribute.findIndex((r: AttributeAssignment) => r.id === attribute.id)
      newAttribute.splice(targetIdx, 1, attribute)
    } else {
      attribute.id = uuidv4()
      newAttribute.push(attribute)
    }
    form?.setFieldValue('attributeAssignments', newAttribute)
  }

  const getAttributeAssignments = () => {
    return form?.getFieldValue('attributeAssignments') ?? [] as AttributeAssignment []
  }

  const footer = (
    <Drawer.FormFooter
      onCancel={() => {
        onClose()
      }}
      buttonLabel={{
        save: $t({ defaultMessage: 'Add' })
      }}
      onSave={handleAddGroup}
    />
  )

  const onAddClick = () => {
    setEditAttributeMode(false)
    setEditAttribute({
      attributeName: '' ,
      operator: OperatorType.ADD,
      attributeValue: ''
    } as AttributeAssignment)
    setAttributeDialogVisible(true)
  }

  const onEditClick = (attribute: AttributeAssignment) => {
    setEditAttribute(attribute)
    setEditAttributeMode(true)
    setAttributeDialogVisible(true)
  }

  const content = (
    <Form
      layout={'vertical'}
      form={form}>
      <RadiusAttributeGroupSettingForm
        onAddClick={onAddClick}
        onEditClick={onEditClick}/>
    </Form>
  )

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Add RADIUS Attribute Group' })}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={footer}
        width={600}
      />
      <RadiusAttributeDialog
        onCancel={() => {
          setAttributeDialogVisible(false)
        }}
        visible={attributeDialogVisible}
        setAttributeAssignments={setAttributeAssignments}
        editAttribute={editAttribute}
        isEdit={editAttributeMode}
        getAttributeAssignments={getAttributeAssignments}/>
    </>
  )
}
