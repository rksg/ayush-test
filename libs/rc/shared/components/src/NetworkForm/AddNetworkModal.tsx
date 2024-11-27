import { useIntl } from 'react-intl'

import { Modal, ModalType } from '@acx-ui/components'
import { NetworkTypeEnum }  from '@acx-ui/rc/utils'

import { NetworkForm } from './NetworkForm'

interface AddNetworkModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
  title?: string
  createType?: NetworkTypeEnum
  defaultValues?: Record<string, unknown>,
}

export const AddNetworkModal = (props: AddNetworkModalProps) => {
  const { visible, setVisible, title, ...others } = props
  const { $t } = useIntl()

  const closeMoadl = () => {
    setVisible(false)
  }

  return (
    <Modal
      title={title ?? $t({ defaultMessage: 'Add Wi-Fi Network' })}
      width={1100}
      visible={visible}
      type={ModalType.ModalStepsForm}
      mask={true}
      destroyOnClose={true}
    >
      <NetworkForm
        modalCallBack={closeMoadl}
        modalMode
        {...others}
      />
    </Modal>
  )
}