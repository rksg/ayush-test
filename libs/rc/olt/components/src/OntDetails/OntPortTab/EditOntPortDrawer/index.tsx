import { Button, Space } from 'antd'
import { useIntl }       from 'react-intl'

import { Drawer } from '@acx-ui/components'

export const EditOntPortDrawer = (props: {
  visible: boolean
  setVisible: (visible: boolean) => void
}) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit Port' })}
      visible={visible}
      onClose={onClose}
      mask={true}
      maskClosable={true}
      width={570}
      footer={
        <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
          <Button onClick={onClose}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
          <Button type='primary' onClick={onClose}>
            {$t({ defaultMessage: 'Apply' })}
          </Button>
        </Space>
      }
      children={<div>EditOntPortDrawer</div>}
    />
  )
}
