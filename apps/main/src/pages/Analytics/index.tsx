import { Loader } from '@acx-ui/components'
import { Outlet } from '@acx-ui/react-router-dom'

function Analytics () {
  return <Loader>
    <Outlet />
  </Loader>
}

export default Analytics
