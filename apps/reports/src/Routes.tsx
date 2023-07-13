import { PageNotFound }      from '@acx-ui/components'
import { rootRoutes, Route } from '@acx-ui/react-router-dom'
import { ReportType }        from '@acx-ui/reports/components'
import { Provider }          from '@acx-ui/store'

import { DataStudio } from './pages/DataStudio'
import { Report }     from './pages/Report'
import { ReportList } from './pages/ReportList'

const reports = {
  overview: <Report type={ReportType.OVERVIEW} showFilter={false} />,
  wireless: <Report type={ReportType.WIRELESS} />,
  wired: <Report type={ReportType.WIRED} />,
  aps: <Report type={ReportType.ACCESS_POINT} />,
  switches: <Report type={ReportType.SWITCH} />,
  clients: <Report type={ReportType.CLIENT} />,
  applications: <Report type={ReportType.APPLICATION} />,
  wlans: <Report type={ReportType.WLAN} />,
  airtime: <Report type={ReportType.AIRTIME_UTILIZATION} />
}

export default function ReportsRoutes () {
  const routes = rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='reports' element={<ReportList />}/>
      <Route path='reports/overview' element={reports.overview}/>
      <Route path='reports/wireless' element={reports.wireless} />
      <Route path='reports/wired' element={reports.wired} />
      <Route path='reports/aps' element={reports.aps} />
      <Route path='reports/switches' element={reports.switches} />
      <Route path='reports/clients' element={reports.clients}/>
      <Route path='reports/applications' element={reports.applications} />
      <Route path='reports/wlans' element={reports.wlans} />
      <Route path='reports/airtime' element={reports.airtime} />
      <Route path='dataStudio' element={<DataStudio />} />
    </Route>
  )
  return (
    <Provider>
      {routes}
    </Provider>
  )
}
