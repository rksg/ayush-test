import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import CustomizedDashboard from '../CustomizedDashboard'
import Dashboard           from '../Dashboard'

export default function DashboardFF () {
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE) // TODO: Create FF

  return (
    isEdgeReady ? <CustomizedDashboard /> : <Dashboard />
  )
}