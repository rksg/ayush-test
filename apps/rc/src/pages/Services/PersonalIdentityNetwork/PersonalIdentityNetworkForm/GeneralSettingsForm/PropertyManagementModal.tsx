import { Dispatch, SetStateAction } from 'react'

import { useIntl } from 'react-intl'

import { Modal, ModalType, Tabs }      from '@acx-ui/components'
import { VenuePropertyManagementForm } from '@acx-ui/rc/components'

interface PropertyManagementModalProps {
  venueId: string
  venueName: string
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}

export const PropertyManagementModal = (props: PropertyManagementModalProps) => {

  const { venueId, venueName, visible, setVisible } = props
  const { $t } = useIntl()

  const closeModal = () => {
    setVisible(false)
  }

  const content = <Tabs activeKey='property-management'>
    <Tabs.TabPane
      tab={$t({ defaultMessage: 'Property Management' })}
      key='property-management'
    >
      <VenuePropertyManagementForm
        venueId={venueId}
        onCancel={closeModal}
        postSubmit={closeModal}
      />
    </Tabs.TabPane>
  </Tabs>

  return (
    <Modal
      title={venueName}
      width={1100}
      visible={visible}
      type={ModalType.ModalStepsForm}
      mask={true}
      children={content}
    />
  )
}