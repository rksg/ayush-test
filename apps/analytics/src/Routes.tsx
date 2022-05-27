import { RootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

export default function AnalyticsRoutes () {
  return <Provider>
    <RootRoutes>
      <Route path='/t/:tenantId' />
    </RootRoutes>
  </Provider>
}
