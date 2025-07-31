import { SwitchViewModel } from '@acx-ui/rc/utils'
import { SwitchPortTable } from '@acx-ui/switch/components'

export function SwitchOverviewPorts (props: {
  switchDetail?: SwitchViewModel
}) {
  const { switchDetail } = props
  return <SwitchPortTable
    isVenueLevel={false}
    switchDetail={switchDetail}
  />
}