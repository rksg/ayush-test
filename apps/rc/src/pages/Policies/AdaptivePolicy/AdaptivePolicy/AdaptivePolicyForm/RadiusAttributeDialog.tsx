import { useEffect } from 'react'

import { useForm } from 'antd/lib/form/Form'
import { useIntl } from 'react-intl'

import { Modal, showToast }    from '@acx-ui/components'
import { AttributeAssignment } from '@acx-ui/rc/utils'

import { RadiusAttributeForm } from '../../RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeForm'


interface RadiusAttributeDialogProps {
  visible: boolean,
  onCancel: () => void,
  setAttributeAssignments: (attributeAssignments: AttributeAssignment) => void,
  isEdit?: boolean
  editAttribute?: AttributeAssignment,
}

export function RadiusAttributeDialog (props: RadiusAttributeDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const { visible, onCancel, setAttributeAssignments, isEdit, editAttribute } = props

  useEffect(() => {
    if (editAttribute && visible) {
      form.setFieldsValue(editAttribute)
    }
  }, [editAttribute, visible])

  const triggerSubmit = () => {
    try {
      form.validateFields().then(values => {
        // console.log('Current dialog fields value = ', values)
        setAttributeAssignments(values)
        onModalCancel()
      })
    } catch (e) {
      if (e instanceof Error) {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'An error occurred' })
        })
      }
    }
  }

  const onModalCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={isEdit ? $t({ defaultMessage: 'Edit RADIUS Attribute' }) :
        $t({ defaultMessage: 'Add RADIUS Attribute' })}
      visible={visible}
      okText={
        isEdit ? $t({ defaultMessage: 'Done' }) :
          $t({ defaultMessage: 'Add' })
      }
      onOk={triggerSubmit}
      onCancel={onModalCancel}>
      <RadiusAttributeForm form={form}/>
    </Modal>
  )
}
