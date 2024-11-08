import { Dispatch, SetStateAction, useContext } from 'react'

import { useIntl } from 'react-intl'

import { Modal, ModalType, useStepFormContext }             from '@acx-ui/components'
import { NetworkForm }                                      from '@acx-ui/rc/components'
import { NetworkTypeEnum, PersonalIdentityNetworkFormData } from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

interface AddDpskModalProps {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}

export const AddDpskModal = (props: AddDpskModalProps) => {

  const { visible, setVisible } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const { personaGroupData, addNetworkCallback } = useContext(PersonalIdentityNetworkFormContext)
  const venueId = form.getFieldValue('venueId')

  const onModalCallBack = () => {
    // close modal
    setVisible(false)

    if (personaGroupData?.dpskPoolId)
      addNetworkCallback(personaGroupData.dpskPoolId)
  }

  const content = <NetworkForm
    createType={NetworkTypeEnum.DPSK}
    defaultActiveVenues={[venueId]}
    modalCallBack={onModalCallBack}
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