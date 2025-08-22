import { useIntl } from 'react-intl'

import { Drawer }  from '@acx-ui/components'
import { OltCage } from '@acx-ui/olt/utils'

export const EditCageDrawer = (props: {
  data: OltCage | null,
  visible: boolean
  setVisible: (visible: boolean) => void
}) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit Cage' })}
      visible={visible}
      onClose={() => setVisible(false)}
      width={610}
      children={<div>
        {/* TODO */}
      </div>}
    />
  )
}
