import { Dispatch, SetStateAction } from 'react'

import { useIntl } from 'react-intl'

import { Modal, ModalType, useStepFormContext } from '@acx-ui/components'
import { NetworkForm }                          from '@acx-ui/rc/components'
import { NetworkTypeEnum }                      from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkFormData } from '..'

interface AddDpskModalProps {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}

export const AddDpskModal = (props: AddDpskModalProps) => {

  const { visible, setVisible } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const venueId = form.getFieldValue('venueId')

  const closeMoadl = () => {
    setVisible(false)
  }

  const content = <NetworkForm
    createType={NetworkTypeEnum.DPSK}
    defaultActiveVenues={[venueId]}
    modalCallBack={closeMoadl}
    modalMode
  />

  return (
    <Modal
      title={$t({ defaultMessage: 'Create New Network' })}
      width={1100}
      visible={visible}
      type={ModalType.ModalStepsForm}
      mask={true}
      children={content}
      destroyOnClose={true}
    />

  )
}