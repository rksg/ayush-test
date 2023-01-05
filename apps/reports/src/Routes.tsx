
import { createContext, useState } from 'react'

import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'

import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { ReportType  }                       from '@acx-ui/reports/utils'
import { Provider }                          from '@acx-ui/store'
import { NetworkPath }                       from '@acx-ui/utils'

import { Report } from './pages/Report'

export interface NetworkFilterWithBand {
  paths?: NetworkPath[],
  bands?: CheckboxValueType[],
  value?: SingleValueType | SingleValueType[]
}

export const NetworkFilterWithBandContext = createContext({} as {
  filterData: NetworkFilterWithBand,
  setFilterData: (data:NetworkFilterWithBand) => void
})

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
  const [filterData, setFilterData] = useState<NetworkFilterWithBand>({})
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='reports' element={<TenantNavigate replace to='/reports/overview' />}/>
      <Route path='reports/overview' element={reports.overview}/>
      <Route path='reports/wireless' element={reports.wireless} />
      <Route path='reports/wired' element={reports.wired} />
      <Route path='reports/aps' element={reports.aps} />
      <Route path='reports/switches' element={reports.switches} />
      <Route path='reports/clients' element={reports.clients}/>
      <Route path='reports/applications' element={reports.applications} />
      <Route path='reports/wlans' element={reports.wlans} />
      <Route path='reports/airtime' element={reports.airtime} />
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
