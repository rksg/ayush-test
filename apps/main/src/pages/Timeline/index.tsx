import { Loader } from '@acx-ui/components'
import { Outlet } from '@acx-ui/react-router-dom'

function Timeline () {
  return <Loader>
    <Outlet />
  </Loader>
}

export default Timeline
