import { EdgeTnmGraphTypeEnum, EdgeTnmServiceStatusEnum } from '../../models/EdgeTnmServiceEnum'

export interface EdgeTnmServiceSetting {
  tenantId?: string
  venueId?: string
  name?: string
}
export interface EdgeTnmServiceData {
  id?: string
  tenantId?: string
  venueId?: string
  name?: string
  version?: string
  status?: EdgeTnmServiceStatusEnum
}
export interface EdgeTnmCreateFormData {
  venueId: string
  edgeClusterId: string
}

export interface EdgeTnmHostGraphConfig {
  uuid: string
  graphid: string
  name: string
  width: number
  height: number
  yaxismin: number
  yaxismax: number
  templateid: string
  show_work_period: string
  show_triggers: string
  graphtype: EdgeTnmGraphTypeEnum
  show_legend: string
  show_3d: string
  percent_left: string
  percent_right: string
  ymin_type: string
  ymax_type: string
  ymin_itemid: string
  ymax_itemid: string
  flags: string
  graphids?: string[]
  groupids?: string[]
  templateids?: string[]
  hostids?: string[]
  itemids?: string[]
  templated?: string
  inherited?: string
  expandName?: string
  selectHostGroups?: string
  selectTemplateGroups?: string
  selectTemplates?: string
  selectHosts?: string
  selectItems?: string
  selectGraphDiscovery?: string
  selectGraphItems?: string
  selectDiscoveryRule?: string
  filter?: string
  sortfield?: string
  countOutput?: string
  editable?: boolean
  excludeSearch?: string
  limit?: string
  output?: string
  preservekeys?: string
  search?: string
  searchByAny?: string
  searchWildcardsEnabled?: string
  sortorder?: string
  startSearch?: string
}

export interface EdgeTnmHostGroup {
  groupid: string
  name: string
  internal?: unknown
}

export interface EdgeTnmHostSetting {
  hostid: string
  host: string
  description: string
  ipmi_authtype: number,
  ipmi_password: string
  ipmi_privilege: number,
  ipmi_username: string
  name: string
  hostname?: string
  maintenanceid: string
  maintenance_status: string
  maintenance_type: string
  maintenance_from: string
  flags: string
  templateid: string
  custom_interfaces: string
  uuid: string
  vendor_name: string
  vendor_version: string
  active_available: string
  assigned_proxyid: string
  parentTemplates: {
    templateid: string
    name: string
  }[],
  hostgroups:{
    groupid: string
    name: string
  }[],
  interfaces: EdgeTnmHostInterface[]
  tags: EdgeTnmHostTag[]
}

interface EdgeTnmHostInterface {
  interfaceid: string,
  type: number,
  main: number,
  useip: number,
  ip: string,
  dns: string,
  port: string,
  details: {
    version: string,
    community: string
  }
}

interface EdgeTnmHostTag {
  tag: string,
  value: string
}

export interface EdgeTnmHostPayload {
  host: string,
  interfaces: EdgeTnmHostInterface[],
  groups: {
    groupid: string
  }[],
  templates: {
    templateid: string
  }[],
  tags: EdgeTnmHostTag[],
  description?: string
}

export interface EdgeTnmHostFormData {
  host: string,
  hostid: string,
  groupIds: string[],
  interface: {
    interfaceid: string,
    ip: string,
    port: string
  }
}

export interface EdgeTnmGraphItem {
  gitemid: string
  graphid: string
  itemid: string
  drawtype: string
  sortorder: string
  color: string
  yaxisside: string
  calc_fnc: string
  type: string
}

export interface EdgeTnmGraphItemInfo {
  itemid: string
  name: string
}

export interface EdgeTnmGraphHistory {
  itemid: string
  clock: string
  value: string
  ns: string
}