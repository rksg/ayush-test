import React from 'react'

import { useIntl } from 'react-intl'

import { Drawer }        from '@acx-ui/components'
import { VenueExtended } from '@acx-ui/rc/utils'

import { VenuesForm } from '../../../Venues'

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
  const { $t } = useIntl()
  const handleVenueCreated = (venue?: VenueExtended) => {
    onSuccess?.(venue)
    onClose()
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add <VenueSingular></VenueSingular>' })}
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