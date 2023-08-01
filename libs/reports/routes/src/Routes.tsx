import { PageNotFound }                               from '@acx-ui/components'
import { get }                                        from '@acx-ui/config'
import { rootRoutes, Route, MLISA_BASE_PATH }         from '@acx-ui/react-router-dom'
import { ReportType, Report, ReportList, DataStudio } from '@acx-ui/reports/components'
import { Provider }                                   from '@acx-ui/store'

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
  const basePath = get('IS_MLISA_SA') ? MLISA_BASE_PATH : ':tenantId/t'
  const routes = rootRoutes(
    <Route path={basePath}>
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
