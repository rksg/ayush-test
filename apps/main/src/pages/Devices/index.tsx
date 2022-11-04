import { Loader } from '@acx-ui/components'
import { Outlet } from '@acx-ui/react-router-dom'

function Devices () {
  return <Loader>
    <Outlet />
  </Loader>
}

export default Devices
