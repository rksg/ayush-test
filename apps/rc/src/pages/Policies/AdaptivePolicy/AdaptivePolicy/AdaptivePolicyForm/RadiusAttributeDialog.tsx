import { useEffect } from 'react'

import { useForm } from 'antd/lib/form/Form'
import { useIntl } from 'react-intl'

import { Modal }               from '@acx-ui/components'
import { AttributeAssignment } from '@acx-ui/rc/utils'

import { RadiusAttributeForm } from '../../RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeForm'


interface RadiusAttributeDialogProps {
  visible: boolean,
  onCancel: () => void,
  setAttributeAssignments: (attributeAssignments: AttributeAssignment) => void,
  isEdit?: boolean
  editAttribute?: AttributeAssignment,
  getAttributeAssignments: () => AttributeAssignment[]
}

export function RadiusAttributeDialog (props: RadiusAttributeDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  // eslint-disable-next-line max-len
  const { visible, onCancel, setAttributeAssignments, isEdit, editAttribute, getAttributeAssignments } = props

  useEffect(() => {
    if (editAttribute && visible) {
      form.setFieldsValue(editAttribute)
    }
  }, [editAttribute, visible])

  const triggerSubmit = async () => {
    try {
      await form.validateFields().then(values => {
        setAttributeAssignments(values)
        onModalCancel()
      })
    } catch (error) {
      if (error instanceof Error) throw error
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
      <RadiusAttributeForm form={form}
        editAttribute={editAttribute}
        getAttributeAssignments={getAttributeAssignments}/>
    </Modal>
  )
}
