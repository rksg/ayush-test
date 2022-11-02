import { ConfigProvider }    from '@acx-ui/components'
import { ServiceType }       from '@acx-ui/rc/utils'
import { rootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { NetworkDetails }         from './pages/Networks/NetworkDetails/NetworkDetails'
import { NetworkForm }            from './pages/Networks/NetworkForm/NetworkForm'
import { NetworksTable }          from './pages/Networks/NetworksTable'
import RogueAPDetectionDetailView
  from './pages/Policies/RogueAPDetection/RogueAPDetectionDetail/RogueAPDetectionDetailView'
import RogueAPDetectionForm  from './pages/Policies/RogueAPDetection/RogueAPDetectionForm/RogueAPDetectionForm'
import { DHCPForm }          from './pages/Services/DHCPForm/DHCPForm'
import { MdnsProxyForm }     from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import { SelectServiceForm } from './pages/Services/SelectServiceForm'
import {
  getSelectServiceRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from './pages/Services/serviceRouteUtils'
import { ServicesTable } from './pages/Services/ServicesTable'

export default function RcRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='networks/*' element={<NetworkRoutes />} />
      <Route path='services/*' element={<ServiceRoutes />} />
      <Route path='policies/*' element={<PolicyRoutes />} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}

function NetworkRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='networks' element={<NetworksTable />} />
      <Route path='networks/add' element={<NetworkForm />} />
      <Route
        path='networks/:networkId/network-details/:activeTab'
        element={<NetworkDetails />}
      />
      <Route
        path='networks/:networkId/:action'
        element={<NetworkForm />}
      />
    </Route>
  )
}

function ServiceRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path={getServiceListRoutePath()} element={<ServicesTable />} />
      <Route path={getSelectServiceRoutePath()} element={<SelectServiceForm />} />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })}
        element={<MdnsProxyForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })}
        element={<MdnsProxyForm editMode={true} />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })}
        element={<h1>mDNS Proxy details page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
        element={<h1>WIFI_CALLING create page</h1>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={<h1>WIFI_CALLING edit page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={<h1>WIFI_CALLING details page</h1>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}
        element={<DHCPForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT })}
        element={<DHCPForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.DETAIL })}
        element={<h1>DHCP details page</h1>}
      />
    </Route>
  )
}

function PolicyRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route
        path='policies/rogueAPDetection/create'
        element={<RogueAPDetectionForm edit={false}/>}
      />
      <Route
        path='policies/rogueAPDetection/:policyId/edit'
        element={<RogueAPDetectionForm edit={true}/>}
      />
      <Route
        path='policies/rogueAPDetection/:policyId/detail'
        element={<RogueAPDetectionDetailView />}
      />
    </Route>
  )
}
