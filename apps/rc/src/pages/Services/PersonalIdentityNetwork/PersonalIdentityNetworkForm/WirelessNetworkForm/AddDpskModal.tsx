import { Dispatch, SetStateAction } from 'react'

import { useIntl } from 'react-intl'

import { Modal, ModalType, useStepFormContext }             from '@acx-ui/components'
import { NetworkForm }                                      from '@acx-ui/rc/components'
import { serviceApi }                                       from '@acx-ui/rc/services'
import { NetworkTypeEnum, PersonalIdentityNetworkFormData } from '@acx-ui/rc/utils'
import { store }                                            from '@acx-ui/store'

interface AddDpskModalProps {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}

export const AddDpskModal = (props: AddDpskModalProps) => {

  const { visible, setVisible } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const venueId = form.getFieldValue('venueId')

  const onModalCallBack = () => {
    // close modal
    setVisible(false)

    // refetch DPSK
    store.dispatch(
      serviceApi.util.invalidateTags([
        { type: 'Dpsk', id: 'DETAIL' }
      ]))

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