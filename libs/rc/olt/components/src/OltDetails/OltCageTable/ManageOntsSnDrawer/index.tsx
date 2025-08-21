import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

export const ManageOntsSnDrawer = (props: {
  visible: boolean
  setVisible: (visible: boolean) => void
}) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage ONTs' })}
      visible={visible}
      onClose={() => setVisible(false)}
      width={980}
      children={<div>
        {/* TODO */}
      </div>}
    />
  )
}
