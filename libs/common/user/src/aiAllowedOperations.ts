import { RolesEnum as Role } from '@acx-ui/types'

import { UserProfile } from './types'
import { hasRoles }    from './userProfile'

// Because we are unable to define scopes for GraphQL APIs in RCG config
// (https://bitbucket.rks-cloud.com/projects/RKSCLOUD/repos/ruckus-cloud-gateway/browse/configs/ruckus-cloud-gateway/configmaps/base/ruckus-cloud-gateway-config-routes.yaml),
// `allowedOperations` endpoint is not able to provide the list of allowed operations for a logged in
// user. To help with this, `getAIAllowedOperations` can be used to augment the list using roles and scopes.

// Map of operations to pseudo-URIs
export const opsApis = {
  updateIncident: 'PATCH:/incidents/{id}',
  updateIntentAI: 'PATCH:/intentAI/{id}',
  updateHealthKpiThreshold: 'PATCH:/healthKpiThreshold/{id}',
  createServiceValidation: 'POST:/serviceValidation',
  updateServiceValidation: 'PATCH:/serviceValidation/{id}',
  deleteServiceValidation: 'DELETE:/serviceValidation/{id}',
  createVideoCallQoe: 'POST:/videoCallQoe',
  updateVideoCallQoe: 'PATCH:/videoCallQoe/{id}',
  deleteVideoCallQoe: 'DELETE:/videoCallQoe/{id}',
  createReportSchedules: 'POST:/reportSchedules',
  updateReportSchedules: 'PATCH:/reportSchedules/{id}',
  deleteReportSchedules: 'DELETE:/reportSchedules/{id}'
}

// Operations available for each scope
const aiOperations = [
  {
    scope: ['ai.incidents-u'],
    uri: [
      opsApis.updateIncident,
      opsApis.updateIntentAI
    ]
  },
  {
    scope: ['ai.assurance-c'],
    uri: [
      opsApis.createServiceValidation,
      opsApis.createVideoCallQoe
    ]
  },
  {
    scope: ['ai.assurance-u'],
    uri: [
      opsApis.updateHealthKpiThreshold,
      opsApis.updateServiceValidation,
      opsApis.updateVideoCallQoe
    ]
  },
  {
    scope: ['ai.assurance-d'],
    uri: [
      opsApis.deleteServiceValidation,
      opsApis.deleteVideoCallQoe
    ]
  },
  {
    scope: ['bi.reports-c'],
    uri: [
      opsApis.createReportSchedules
    ]
  },
  {
    scope: ['bi.reports-u'],
    uri: [
      opsApis.updateReportSchedules
    ]
  },
  {
    scope: ['bi.reports-d'],
    uri: [
      opsApis.deleteReportSchedules
    ]
  }
]

export function getAIAllowedOperations (profile: UserProfile | undefined) {
  return aiOperations.filter(op => {
    if (hasRoles([Role.PRIME_ADMIN, Role.ADMINISTRATOR])) return true
    return op.scope.some(scope => profile?.scopes?.includes(scope) || false)
  })
}
