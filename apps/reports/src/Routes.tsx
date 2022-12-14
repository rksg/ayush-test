
import { createContext, useState } from 'react'


import { CheckboxValueType } from 'antd/lib/checkbox/Group'

import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'
import { NetworkPath }                       from '@acx-ui/utils'

import { Report }        from './pages/Reports'
import { NetworkReport } from './pages/Reports/Network'
import { ReportType  }   from './pages/Reports/reportsMapping'

export interface NetworkFilterWithBand {
  paths?: NetworkPath[],
  bands?: CheckboxValueType[]
}

export const NetworkFilterWithBandContext = createContext({} as {
  filterData: NetworkFilterWithBand,
  setFilterData: (data:NetworkFilterWithBand) => void
})

const reports = {
  aps: <Report type={ReportType.ACCESS_POINT}/>,
  switches: <Report type={ReportType.SWITCH}/>,
  clients: <Report type={ReportType.CLIENT}/>,
  applications: <Report type={ReportType.APPLICATION} />
}

export default function ReportsRoutes () {
  const [filterData, setFilterData] = useState<NetworkFilterWithBand>({})
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
    <Provider>
      <NetworkFilterWithBandContext.Provider value={{ filterData, setFilterData }}>
        {routes}
      </NetworkFilterWithBandContext.Provider>
    </Provider>
  )
}
