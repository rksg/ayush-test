import React from 'react'

import { Drawer }        from '@acx-ui/components'
import { VenuesForm }    from '@acx-ui/main/components'
import { VenueExtended } from '@acx-ui/rc/utils'

interface VenueDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess?: (venue?: VenueExtended) => void
}

export const VenueDrawer: React.FC<VenueDrawerProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const handleVenueCreated = (venue?: VenueExtended) => {
    onSuccess?.(venue)
    onClose()
  }

  return (
    <Drawer
      title='Add Venue'
      width={600}
      visible={open}
      onClose={onClose}
      destroyOnClose={true}
      footer={null}
    >
      <VenuesForm
        modalMode={true}
        modalCallBack={handleVenueCreated}
      />
    </Drawer>
  )
}