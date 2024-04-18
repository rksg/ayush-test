import { PageNotFound }                               from '@acx-ui/components'
import { get }                                        from '@acx-ui/config'
import { rootRoutes, Route, MLISA_BASE_PATH }         from '@acx-ui/react-router-dom'
import { ReportType, Report, ReportList, DataStudio } from '@acx-ui/reports/components'
import { Provider }                                   from '@acx-ui/store'
import { SwitchScopes, WifiScopes }                   from '@acx-ui/types'
import { AuthRoute }                                  from '@acx-ui/user'

export default function ReportsRoutes () {
  const isRa = get('IS_MLISA_SA')
  const basePath = isRa ? MLISA_BASE_PATH : ':tenantId/t'
  const reports = {
    overview: <Report type={ReportType.OVERVIEW} showFilter={false} />,
    wireless: <Report type={ReportType.WIRELESS}/>,
    wired: <Report type={ReportType.WIRED} />,
    aps: <Report type={ReportType.ACCESS_POINT} />,
    switches: <Report type={ReportType.SWITCH} />,
    clients: <Report type={ReportType.CLIENT} />,
    applications: <Report type={ReportType.APPLICATION} />,
    wlans: <Report type={ReportType.WLAN} />,
    airtime: <Report type={ReportType.AIRTIME_UTILIZATION} />
  }

  const routes = rootRoutes(
    <Route path={basePath}>
      <Route path='*' element={<PageNotFound />} />
      <Route path='reports' element={<ReportList />}/>
      <Route path='reports/overview' element={reports.overview}/>
      <Route path='reports/wireless'
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>{ reports.wireless }</AuthRoute>
        } />
      <Route path='reports/wired'
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>{ reports.wired }</AuthRoute>
        } />
      <Route path='reports/aps'
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>{ reports.aps }</AuthRoute>
        } />
      <Route path='reports/switches'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>{ reports.switches }</AuthRoute>
        } />
      <Route path='reports/clients'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>{ reports.clients }</AuthRoute>
        }/>
      <Route path='reports/applications'
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>{ reports.applications }</AuthRoute>
        } />
      <Route path='reports/wlans'
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>{ reports.wlans }</AuthRoute>
        } />
      <Route path='reports/airtime'
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>{ reports.airtime }</AuthRoute>
        } />
      <Route path='dataStudio' element={<DataStudio />} />
    </Route>
  )
  return (
    <Provider>
      {routes}
    </Provider>
  )
}
