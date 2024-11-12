import { SwitchPortTable } from '@acx-ui/rc/components'
import { SwitchViewModel } from '@acx-ui/rc/utils'

export function SwitchOverviewPorts (props: {
  switchDetail?: SwitchViewModel
}) {
  const { switchDetail } = props
  return <SwitchPortTable
    isVenueLevel={false}
    switchDetail={switchDetail}
  />
}