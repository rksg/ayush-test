import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'

import { IncidentDetailsData, useIncidentDetailsQuery } from './services'

import Assoc  from './Details/Assoc'
import Auth   from './Details/Auth'
import Dhcp   from './Details/Dhcp'
import Eap    from './Details/Eap'
import Radius from './Details/Radius'

export const seriesMapping = [
  { key: 'code', name: 'code' }
] as Array<{ key: keyof IncidentDetailsData, name: string }>

export const incidentDetailsMap = {
  radius: () => <Radius />,
  dhcp: () => <Dhcp />,
  eap: () => <Eap />,
  auth: () => <Auth />,
  assoc: () => <Assoc />
}

function IncidentDetails () {
  const filters = useGlobalFilter()
  const queryResults = useIncidentDetailsQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getSeriesData(data!, seriesMapping),
        ...rest
      })
    })
  console.log(queryResults)
  // const code = queryResults.data.code
  const code = 'radius'
  const IncidentDetail = incidentDetailsMap[code]
  return <IncidentDetail />
}

export default IncidentDetails
