// import { CommonUrlsInfo, createHttpRequest } from '@acx-ui/rc/utils'

import { RoleMapping, RolesMappingDic } from './role-mapping'

export class RoleBasedAccessService {
  public static allowedOperationsList: string[] = []
  tenantId: string | undefined

  private static allowedMspOperationList: string[] =
    [
      'PUT:/api/mspservice/tenant/{tenantId}/{mspEcTenantId}',
      'DELETE:/api/mspservice/tenant/{tenantId}/{mspEcTenantId}}',
      'POST:/api/mspservice/tenant/{tenantId}/admin',
      'POST:/api/mspservice/tenant/{tenantId}/deactivation',
      'POST:/api/mspservice/tenant/{tenantId}/reactivation',
      'POST:/api/mspservice/tenant/{tenantId}/mspecaccounts',
      'put:/api/mspservice/tenant/{tenantId}/msplabel',
      'ExportEcToCsv',
      'GET:/api/mspservice/tenant/{tenantId}/mspecaccounts'
    ]

  private static allowedLteOperationList: string[] =
    [
      'AddLteApButton', 'EditLteApButton', 'DeleteLteApButton', 'ExportLteApsButton',
      'AddSasAccount', 'EditSasAccount', 'DeleteSasAccount',
      'AddEcgiRecord', 'EditEcgiRecord', 'DeleteEcgiRecord',
      'AddExternalTimingMaster', 'EditExternalTimingMaster', 'DeleteExternalTimingMaster',
      'AddCpiDetails', 'EditCpiDetails', 'DeleteCpiDetails'
    ]

  private static allowedWebSocketOperationList: string[] =
    [
      'EnableCliSessionButton'
    ]

  public static getOperationsList (): string[] {
    return this.allowedOperationsList
  }

  public appendRolesToDictionary (dict: { [id: string]: RoleMapping[] }) {
    Object.keys(dict).forEach(key => {
      const value = dict[key]
      RolesMappingDic[key] = value
    })
  }
}

