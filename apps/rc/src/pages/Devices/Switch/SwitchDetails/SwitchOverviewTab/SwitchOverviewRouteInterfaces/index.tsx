import { SwitchViewModel } from '@acx-ui/rc/utils'
import { SwitchVeTable }   from '@acx-ui/switch/components'

export function SwitchOverviewRouteInterfaces (props: {
  switchDetail?: SwitchViewModel
}) {
  return <SwitchVeTable isVenueLevel={false} switchInfo={props.switchDetail} />
}
