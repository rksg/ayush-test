import Assoc  from './Details/Assoc'
import Auth   from './Details/Auth'
import Dhcp   from './Details/Dhcp'
import Eap    from './Details/Eap'
import Radius from './Details/Radius'

export const incidentDetailsMap = {
  radius: () => <Radius />,
  dhcp: () => <Dhcp />,
  eap: () => <Eap />,
  auth: () => <Auth />,
  assoc: () => <Assoc />
}

function IncidentDetails () {
  // query code to render correct incident detail
  // const IncidentDetail = incidentDetailsMap[code]
  // return <IncidentDetail />

  return <></>
}
export default IncidentDetails
