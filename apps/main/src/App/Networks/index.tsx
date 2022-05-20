import { Loader } from '@acx-ui/components'
import { Outlet } from '@acx-ui/react-router-dom'

function Networks () {
  return <Loader>
    <Outlet />
  </Loader>
}

export default Networks
