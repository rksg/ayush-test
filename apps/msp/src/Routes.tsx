import { ConfigProvider }    from '@acx-ui/components'
import { rootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path='v/:mspId' element={<div>MSP Page</div>}>
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}
