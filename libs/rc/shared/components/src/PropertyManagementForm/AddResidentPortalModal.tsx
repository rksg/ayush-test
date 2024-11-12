import { FormInstance } from 'antd'
import { useIntl }      from 'react-intl'

import { Modal, ModalType } from '@acx-ui/components'

import { ResidentPortalForm } from '../services/ResidentPortal'

interface AddResidentPortalModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  form?: FormInstance
  onCancel?: () => void
}

export const AddResidentPortalModal = (props: AddResidentPortalModalProps) => {
  const { visible, setVisible, form, onCancel } = props
  const { $t } = useIntl()

  const closeModal = () => setVisible(false)

  return (
    <Modal
      title={$t({ defaultMessage: 'Add Resident Portal service' })}
      type={ModalType.ModalStepsForm}
      visible={visible}
      children={
        <ResidentPortalForm
          modalMode
          modalCallBack={(result?: string) => {
            if (result && form) {
              form.setFieldValue('residentPortalId', result?.split('/')?.pop())
            }
            onCancel?.() || closeModal()
          }}
        />
      }
      onCancel={onCancel || closeModal}
      width={1200}
      destroyOnClose={true}
    />
  )
}
