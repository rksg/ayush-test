import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

export const ManageOntsDrawer = (props: {
  visible: boolean
  onClose: () => void
  onOpenEditOnt: () => void
}) => {
  const { $t } = useIntl()
  const { visible, onClose, onOpenEditOnt } = props

  const handleEditOntClick = () => {
    onOpenEditOnt()
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage ONTs' })}
      visible={visible}
      onClose={onClose}
      mask={true}
      maskClosable={true}
      width={980}
      zIndex={999}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>
            {$t({ defaultMessage: 'Close' })}
          </Button>
        </div>
      }
      children={<div>
        <Button onClick={handleEditOntClick}>{ //temp
          $t({ defaultMessage: 'Edit ONT' })
        }</Button>
      </div>}
    />
  )
}
