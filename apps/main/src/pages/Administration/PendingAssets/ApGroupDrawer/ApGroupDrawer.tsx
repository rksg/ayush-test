import React from 'react'

import { useIntl } from 'react-intl'

import { Drawer }                     from '@acx-ui/components'
import { ApGroupGeneralTab }          from '@acx-ui/rc/components'
import { ApGroupEditContextProvider } from '@acx-ui/rc/components'

interface ApGroupDrawerProps {
  open: boolean
  onClose: () => void
}

export const ApGroupDrawer: React.FC<ApGroupDrawerProps> = ({
  open,
  onClose
}) => {
  const { $t } = useIntl()
  const handleFinish = async () => {
    onClose()
    return true
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add AP Group' })}
      width={700}
      visible={open}
      onClose={onClose}
      destroyOnClose={true}
      footer={null}
    >
      <ApGroupEditContextProvider>
        <ApGroupGeneralTab handleClose={onClose} onFinish={handleFinish} />
      </ApGroupEditContextProvider>
    </Drawer>
  )
}