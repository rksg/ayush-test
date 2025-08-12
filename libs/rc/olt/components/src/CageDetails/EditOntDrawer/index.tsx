import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

export const EditOntDrawer = (props: {
  visible: boolean
  onClose: () => void
}) => {
  const { $t } = useIntl()
  const { visible, onClose } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit ONT' })}
      visible={visible}
      onClose={onClose}
      mask={true}
      maskClosable={true}
      width={480}
      zIndex={1000}
      children={<div>
      </div>}
    />
  )
}
