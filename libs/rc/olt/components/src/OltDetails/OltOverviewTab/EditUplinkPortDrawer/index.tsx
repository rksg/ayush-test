import { useIntl } from 'react-intl'

import { Drawer }  from '@acx-ui/components'
import { OltPort } from '@acx-ui/olt/utils'

export const EditUplinkPortDrawer = (props: {
  data: OltPort | null,
  visible: boolean
  setVisible: (visible: boolean) => void
}) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit Uplink' })}
      visible={visible}
      onClose={() => setVisible(false)}
      width={610}
      children={<div>
        {/* TODO */}
      </div>}
    />
  )
}
