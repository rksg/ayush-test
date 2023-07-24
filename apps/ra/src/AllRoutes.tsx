import React from 'react'

import { Route, rootRoutes, Navigate, MLISA_BASE_PATH } from '@acx-ui/react-router-dom'
//import { DataStudio, ReportList,Report,ReportType }     from '@acx-ui/reports/components'

import ConfigChange    from './pages/ConfigChange'
import IncidentDetails from './pages/IncidentDetails'
import Incidents       from './pages/Incidents'
import Layout          from './pages/Layout'
import Recommendations from './pages/Recommendations'

// const reports = {
//   overview: <Report type={ReportType.OVERVIEW} showFilter={false} />,
//   wireless: <Report type={ReportType.WIRELESS} />,
//   wired: <Report type={ReportType.WIRED} />,
//   aps: <Report type={ReportType.ACCESS_POINT} />,
//   switches: <Report type={ReportType.SWITCH} />,
//   clients: <Report type={ReportType.CLIENT} />,
//   applications: <Report type={ReportType.APPLICATION} />,
//   wlans: <Report type={ReportType.WLAN} />,
//   airtime: <Report type={ReportType.AIRTIME_UTILIZATION} />
// }
const ReportsRoutes = React.lazy(() => import('@reports/Routes'))
function AllRoutes () {
  return rootRoutes(<Route element={<Layout />}>
    <Route path='/' element={<Navigate replace to={MLISA_BASE_PATH} />} />
    <Route path={MLISA_BASE_PATH}>
      <Route path='dashboard' element={<div>dashboard</div>} />
      <Route path='recommendations' element={<Recommendations />} />
      <Route path='incidents'>
        <Route index={true} element={<Incidents />} />
        <Route index={false} path=':incidentId' element={<IncidentDetails />} />
      </Route>
      <Route path='configChange' element={<ConfigChange />} />
      <Route path='reports/*' element={<ReportsRoutes />} />
      <Route path='dataStudio/*' element={<ReportsRoutes />} />
      {/* <Route path='dataStudio' element={<DataStudio/>} />
      <Route path='reports' element={<ReportList />}/>
      <Route path='reports/overview' element={reports.overview}/>
      <Route path='reports/wireless' element={reports.wireless} />
      <Route path='reports/wired' element={reports.wired} />
      <Route path='reports/aps' element={reports.aps} />
      <Route path='reports/switches' element={reports.switches} />
      <Route path='reports/clients' element={reports.clients}/>
      <Route path='reports/applications' element={reports.applications} />
      <Route path='reports/wlans' element={reports.wlans} />
      <Route path='reports/airtime' element={reports.airtime} /> */}
    </Route>
    <Route path='health' element={<div>Health</div>} />
    <Route path='serviceValidation' element={<div>Service Validation</div>} />
    <Route path='occupancy' element={<div>Occupancy</div>} />
    {/* <Route path='reports' element={<div>Reports</div>} /> */}
    <Route path='admin/*' element={<div>Admin</div>} />
  </Route>)
}

export default AllRoutes
