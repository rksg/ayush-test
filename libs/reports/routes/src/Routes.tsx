import { PageNotFound }                       from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { rootRoutes, Route, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'
import {
  ReportType,
  Report,
  ReportList,
  DataStudio,
  DataConnectorContent,
  ConnectorForm,
  DataConnectorAuditLog,
  CloudStorageForm
} from '@acx-ui/reports/components'
import { Provider }                              from '@acx-ui/store'
import { RolesEnum }                             from '@acx-ui/types'
import { AuthRoute, hasRaiPermission, hasRoles } from '@acx-ui/user'
import { AccountTier }                           from '@acx-ui/utils'

export default function ReportsRoutes () {
  const isRa = get('IS_MLISA_SA')
  const basePath = isRa ? MLISA_BASE_PATH : ':tenantId/t'
  const hasDCStoragePermission = isRa
    ? hasRaiPermission('WRITE_DATA_CONNECTOR_STORAGE')
    : hasRoles(RolesEnum.PRIME_ADMIN)
  const reports = {
    overview: <Report type={ReportType.OVERVIEW} showFilter={false} />,
    wireless: <Report type={ReportType.WIRELESS}/>,
    wired: <Report type={ReportType.WIRED} />,
    aps: <Report type={ReportType.ACCESS_POINT} />,
    switches: <Report type={ReportType.SWITCH} />,
    clients: <Report type={ReportType.CLIENT} />,
    applications: <Report type={ReportType.APPLICATION} />,
    edgeApplications: <Report type={ReportType.EDGE_APPLICATION} />,
    wlans: <Report type={ReportType.WLAN} />,
    airtime: <Report type={ReportType.AIRTIME_UTILIZATION} />,
    rssTraffic: <Report type={ReportType.RSS_TRAFFIC} />,
    rssSession: <Report type={ReportType.RSS_SESSION} />,
    wirelessAirtime: <Report type={ReportType.WIRELESS_AIRTIME} />,
    trafficApplications: <Report type={ReportType.TRAFFIC_APPLICATION} />
  }

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
      <Route path='reports/applications'
        element={
          <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
            {reports.applications}
          </AuthRoute>} />
      <Route path='reports/edgeApplications' element={reports.edgeApplications} />
      <Route path='reports/wlans' element={reports.wlans} />
      <Route path='reports/airtime' element={reports.airtime} />
      <Route path='reports/rssTraffic' element={reports.rssTraffic} />
      <Route path='reports/rssSession' element={reports.rssSession} />
      <Route path='reports/wirelessAirtime' element={reports.wirelessAirtime} />
      <Route path='reports/trafficApplications'
        element={
          <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
            {reports.trafficApplications}
          </AuthRoute>} />
      <Route path='dataStudio' element={<DataStudio />} />
      <Route path='dataConnector' element={<DataConnectorContent />} />
      <Route path='dataConnector/create' element={<ConnectorForm />} />
      <Route path='dataConnector/edit/:settingId'
        element={<ConnectorForm editMode />} />
      <Route path='dataConnector/auditLog/:settingId'
        element={<DataConnectorAuditLog />} />
      {hasDCStoragePermission ? (<>
        <Route path='dataConnector/cloudStorage/create'
          element={<CloudStorageForm />} />
        <Route path='dataConnector/cloudStorage/edit/:csId'
          element={<CloudStorageForm editMode />} />
      </>): []}
    </Route>
  )
  return (
    <Provider>
      {routes}
    </Provider>
  )
}
