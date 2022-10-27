import { Loader } from '@acx-ui/components'
import { Outlet } from '@acx-ui/react-router-dom'

function Policies () {
  return <Loader>
    <Outlet />
  </Loader>
}

export default Policies
