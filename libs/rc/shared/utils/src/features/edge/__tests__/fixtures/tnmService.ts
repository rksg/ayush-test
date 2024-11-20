import { EdgeTnmServiceData } from '../../../../types/services/edgeTnmService'

export const mockTnmServiceDataList = [{
  id: 'mocked-tnm-service-1',
  name: 'Mocked_TNMService_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  version: '7.0.4',
  status: 'UP'
}, {
  id: 'mocked-tnm-service-2',
  name: 'Mocked_TNMService_2',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  version: '7.0.6',
  status: 'INSTALLING'
}] as EdgeTnmServiceData[]

export const mockTnmHostList = [{
  host: 'example-host8',
  description: '',
  ipmi_authtype: -1,
  ipmi_password: '',
  ipmi_privilege: 2,
  ipmi_username: '',
  name: 'example-host8',
  hostid: '10640',
  hostname: null,
  maintenanceid: '0',
  maintenance_status: '0',
  maintenance_type: '0',
  maintenance_from: '0',
  flags: '0',
  templateid: '0',
  custom_interfaces: '0',
  uuid: '',
  vendor_name: '',
  vendor_version: '',
  active_available: '0',
  assigned_proxyid: '0',
  parentTemplates: [{
    templateid: '10001',
    name: 'Linux by Zabbix agent'
  }, {
    templateid: '10047',
    name: 'Zabbix server health'
  }],
  hostgroups: [{
    groupid: '2',
    name: 'Linux servers'
  }],
  interfaces: [{
    interfaceid: '12',
    ip: '192.168.1.1',
    port: '161',
    dns: '',
    details: {
      version: '2',
      bulk: '1',
      community: 'zabbix',
      max_repetitions: '10'
    }
  }],
  tags: [{
    tag: 'host-name',
    value: 'Sibi_Rodan_3u_Stack_Postman_2'
  }]
}]

export const mockTnmHostGraphsConfig = [{
  graphid: '2826',
  name: 'Interface ethernet 1/1/2(): Network traffic',
  uuid: '',
  width: 900,
  height: 200,
  yaxismin: 0.0,
  yaxismax: 100.0,
  templateid: '0',
  show_work_period: '1',
  show_triggers: '1',
  graphtype: '0',
  show_legend: '1',
  show_3d: '0',
  percent_left: '0',
  percent_right: '0',
  ymin_type: '0',
  ymax_type: '0',
  ymin_itemid: '0',
  ymax_itemid: '0',
  flags: '4',
  graphids: null,
  groupids: null,
  templateids: null,
  hostids: null,
  itemids: null,
  templated: null,
  inherited: null,
  expandName: null,
  selectHostGroups: null,
  selectTemplateGroups: null,
  selectTemplates: null,
  selectHosts: null,
  selectItems: null,
  selectGraphDiscovery: null,
  selectGraphItems: null,
  selectDiscoveryRule: null,
  filter: null,
  sortfield: null,
  countOutput: null,
  editable: null,
  excludeSearch: null,
  limit: null,
  output: null,
  preservekeys: null,
  search: null,
  searchByAny: null,
  searchWildcardsEnabled: null,
  sortorder: null,
  startSearch: null
}]

export const mockTnmHostGroups = [
  {
    groupid: '19',
    name: 'Applications',
    internal: null
  },
  {
    groupid: '20',
    name: 'Databases',
    internal: null
  },
  {
    groupid: '5',
    name: 'Discovered hosts',
    internal: null
  },
  {
    groupid: '7',
    name: 'Hypervisors',
    internal: null
  },
  {
    groupid: '24',
    name: 'ICX Network',
    internal: null
  },
  {
    groupid: '2',
    name: 'Linux servers',
    internal: null
  },
  {
    groupid: '23',
    name: 'netwo',
    internal: null
  },
  {
    groupid: '22',
    name: 'network',
    internal: null
  },
  {
    groupid: '6',
    name: 'Virtual machines',
    internal: null
  },
  {
    groupid: '4',
    name: 'Zabbix servers',
    internal: null
  }
]

export const mockTnmGraphItems = [
  {
    gitemid: '271940',
    graphid: '2826',
    itemid: '47604',
    drawtype: '5',
    sortorder: '0',
    color: '199C0D',
    yaxisside: '0',
    calc_fnc: '2',
    type: '0'
  },
  {
    gitemid: '271941',
    graphid: '2826',
    itemid: '47907',
    drawtype: '2',
    sortorder: '1',
    color: 'F63100',
    yaxisside: '0',
    calc_fnc: '2',
    type: '0'
  }]

export const mockTnmItemInfo = [
  {
    itemid: '47604',
    name: 'Interface ethernet 1/1/2(): Inbound packets discarded'
  },
  {
    itemid: '47907',
    name: 'Interface ethernet 1/1/2(): Inbound packets with errors'
  }]

export const mockTnmHistory = [
  {
    itemid: '47907',
    clock: '1731405994',
    value: '512',
    ns: '520692550'
  },
  {
    itemid: '47604',
    clock: '1731405994',
    value: '0',
    ns: '170684595'
  }]
