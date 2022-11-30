import {
  PolicyType,
  ServiceType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  PolicyOperation,
  getServiceListRoutePath,
  getSelectServiceRoutePath,
  ServiceOperation,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import AddEdge                  from './pages/Devices/Edge/AddEdge'
import SwitchesTable            from './pages/Devices/Switch/SwitchesTable'
import ApDetails                from './pages/Devices/Wifi/ApDetails'
import { ApEdit }               from './pages/Devices/Wifi/ApEdit'
import { ApForm }               from './pages/Devices/Wifi/ApForm'
import { ApGroupForm }          from './pages/Devices/Wifi/ApGroupForm'
import ApsTable                 from './pages/Devices/Wifi/ApsTable'
import NetworkDetails           from './pages/Networks/NetworkDetails/NetworkDetails'
import NetworkForm              from './pages/Networks/NetworkForm/NetworkForm'
import NetworksTable            from './pages/Networks/NetworksTable'
import PoliciesTable            from './pages/Policies/PoliciesTable'
import SelectPolicyForm         from './pages/Policies/SelectPolicyForm'
import DHCPDetail               from './pages/Services/DHCPDetail'
import DHCPForm                 from './pages/Services/DHCPForm/DHCPForm'
import MdnsProxyDetail          from './pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail'
import MdnsProxyForm            from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import NetworkSegmentationForm  from './pages/Services/NetworkSegmenationForm/NetworkSegmentationForm'
import PortalServiceDetail      from './pages/Services/Portal/PortalDetail'
import PortalForm               from './pages/Services/Portal/PortalForm/PortalForm'
import SelectServiceForm        from './pages/Services/SelectServiceForm'
import ServicesTable            from './pages/Services/ServicesTable'
import WifiCallingDetailView    from './pages/Services/WifiCalling/WifiCallingDetail/WifiCallingDetailView'
import WifiCallingConfigureForm from './pages/Services/WifiCalling/WifiCallingForm/WifiCallingConfigureForm'
import WifiCallingForm          from './pages/Services/WifiCalling/WifiCallingForm/WifiCallingForm'
import WifiClientDetails        from './pages/Users/Wifi/ClientDetails'
import WifiClientList           from './pages/Users/Wifi/ClientList'

export default function RcRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='devices/*' element={<DeviceRoutes />} />
      <Route path='networks/*' element={<NetworkRoutes />} />
      <Route path='services/*' element={<ServiceRoutes />} />
      <Route path='policies/*' element={<PolicyRoutes />} />
      <Route path='users/*' element={<UserRoutes />} />
    </Route>
  )
  return (
    <Provider children={routes} />
  )
}

function DeviceRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='devices' element={<TenantNavigate replace to='/devices/aps' />} />
      <Route path='devices/aps' element={<ApsTable />} />
      <Route path='devices/aps/:action' element={<ApForm />} />
      <Route path='devices/aps/:serialNumber/:action/:activeTab' element={<ApEdit />} />
      <Route
        path='devices/aps/:serialNumber/:action/:activeTab/:activeSubTab'
        element={<ApEdit />}
      />
      <Route path='devices/apgroups/:action' element={<ApGroupForm />} />
      <Route
        path='devices/aps/:serialNumber/details/:activeTab'
        element={<ApDetails />} />
      <Route
        path='devices/aps/:serialNumber/details/:activeTab/:activeSubTab'
        element={<ApDetails />} />
      <Route
        path='devices/aps/:serialNumber/details/:activeTab/:activeSubTab/:categoryTab'
        element={<ApDetails />} />
      <Route path='devices/edge/add' element={<AddEdge />} />
      <Route path='devices/switches' element={<SwitchesTable />} />
    </Route>
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
        path='networks/:networkId/network-details/:activeTab/:activeSubTab'
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
        element={<MdnsProxyDetail />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
        element={<WifiCallingForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={<WifiCallingConfigureForm />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={<WifiCallingDetailView />}
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
        element={<DHCPDetail/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.CREATE })}
        element={<NetworkSegmentationForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.EDIT })}
        element={<NetworkSegmentationForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })}
        element={<PortalForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT })}
        element={<PortalForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.DETAIL })}
        element={<PortalServiceDetail/>}
      />
    </Route>
  )
}

function PolicyRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path={getPolicyListRoutePath()} element={<PoliciesTable />} />
      <Route path={getSelectPolicyRoutePath()} element={<SelectPolicyForm />} />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })}
        element={<h1>Rogue AP detection create page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.EDIT })}
        element={<h1>Rogue AP detection edit page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.DETAIL })}
        element={<h1>Rogue AP detection details page</h1>}
      />
    </Route>
  )
}

function UserRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='users' element={<TenantNavigate replace to='/users/wifi/clients' />} />
      <Route path='users/wifi' element={<TenantNavigate replace to='/users/wifi/clients' />} />
      <Route path='users/wifi/:activeTab' element={<WifiClientList />} />
      <Route
        path='users/wifi/:activeTab/:clientId/details/'
        element={
          <TenantNavigate replace to='/users/wifi/:activeTab/:clientId/details/overview' />
        }
      />
      <Route
        path='users/wifi/:activeTab/:clientId/details/:activeTab'
        element={<WifiClientDetails />}
      />
    </Route>
  )
}
