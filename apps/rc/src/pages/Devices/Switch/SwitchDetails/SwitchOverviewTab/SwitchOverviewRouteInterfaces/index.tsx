import { SwitchVeTable }   from '@acx-ui/rc/components'
import { SwitchViewModel } from '@acx-ui/rc/utils'

export function SwitchOverviewRouteInterfaces (props: {
  switchDetail?: SwitchViewModel
}) {
  return <SwitchVeTable isVenueLevel={false} switchInfo={props.switchDetail} />
}
