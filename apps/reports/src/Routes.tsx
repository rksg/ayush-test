
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { NetworkReport }      from './pages/NetworkReport'
import { ApplicationsReport } from './pages/Reports/Applications'
import { ApsReport }          from './pages/Reports/Aps'
import { ClientsReport }      from './pages/Reports/Clients'
import { SwitchesReport }     from './pages/Reports/Switches'

export default function ReportsRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='reports'
        element={<TenantNavigate replace to='/reports/network/wireless' />}/>
      <Route
        path='reports/network/:activeTab'
        element={<NetworkReport />} />
      <Route path='reports/aps' element={<ApsReport />} />
      <Route path='reports/switches' element={<SwitchesReport />} />
      <Route path='reports/clients' element={<ClientsReport />} />
      <Route path='reports/applications' element={<ApplicationsReport />} />
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
