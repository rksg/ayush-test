
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { Report }        from './pages/Reports'
import { NetworkReport } from './pages/Reports/Network'
import { ReportType  }   from './pages/Reports/reportsMapping'

const reports = {
  aps: <Report type={ReportType.ACCESS_POINT}/>,
  switches: <Report type={ReportType.SWITCH}/>,
  clients: <Report type={ReportType.CLIENT}/>,
  applications: <Report type={ReportType.APPLICATION} />
}

export default function ReportsRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='reports'
        element={<TenantNavigate replace to='/reports/network/wireless' />}/>
      <Route
        path='reports/network/:activeTab'
        element={<NetworkReport />} />
      <Route path='reports/aps' element={reports.aps} />
      <Route path='reports/switches' element={reports.switches} />
      <Route path='reports/clients' element={reports.clients}/>
      <Route path='reports/applications' element={reports.applications} />
    </Route>
  )
  return (
    <Provider>{routes}</Provider>
  )
}
