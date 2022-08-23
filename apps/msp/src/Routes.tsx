import { ConfigProvider }                    from '@acx-ui/components'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import Layout from './components/Layout'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path='v/:mspId' element={<Layout />}>
      <Route index element={<TenantNavigate to='/dashboard' tenantType='v' />} />
      <Route path='dashboard' element={<div>MSP Page</div>} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}
