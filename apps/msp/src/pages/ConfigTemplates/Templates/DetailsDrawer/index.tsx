import { useIntl } from 'react-intl'

import { Button, Drawer } from '@acx-ui/components'
import { ConfigTemplate } from '@acx-ui/rc/utils'

import { DetailsContent } from './DetailsContent'

interface DetailsDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

export function DetailsDrawer (props: DetailsDrawerProps) {
  const { setVisible, selectedTemplate } = props
  const { $t } = useIntl()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Template Details' })}
      visible={true}
      onClose={onClose}
      footer={<Button onClick={onClose}>{$t({ defaultMessage: 'Close' })}</Button>}
      destroyOnClose={true}
      width={500}
    >
      <DetailsContent template={selectedTemplate} />
    </Drawer>
  )
}
