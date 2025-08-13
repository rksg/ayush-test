import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

export const ManageCageGroupDrawer = (props: {
  visible: boolean
  setVisible: (visible: boolean) => void
}) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage Cage Group' })}
      visible={visible}
      onClose={() => setVisible(false)}
      width={610}
      children={<div>
        {/* TODO */}
      </div>}
    />
  )
}
