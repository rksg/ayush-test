import { useIntl } from 'react-intl'

import { Button, Drawer }      from '@acx-ui/components'
import { CertificateTemplate } from '@acx-ui/rc/utils'


interface ChromebookInstuctionDrawerProps {
  data?: CertificateTemplate
  onClose: () => void
}

export default function ChromebookInstuctionDrawer (props: ChromebookInstuctionDrawerProps) {
  const { $t } = useIntl()
  const { data, onClose } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Chromebook Setup Instuctions' })}
      width={670}
      visible={true}
      onClose={onClose}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            cancel: ''
          }}
          onCancel={onClose}
          extra={<Button onClick={onClose}>Close</Button>}
        />
      }
    >

    </Drawer>
  )
}