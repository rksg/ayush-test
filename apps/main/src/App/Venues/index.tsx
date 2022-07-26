import { Loader } from '@acx-ui/components'
import { Outlet } from '@acx-ui/react-router-dom'

function Venues () {
  return <Loader>
    <Outlet />
  </Loader>
}

export default Venues
