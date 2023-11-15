import { TunnelProfileViewData } from '../../types/policies/tunnelProfile'

export const isDefaultTunnelProfile = (profile: TunnelProfileViewData, tenantId: string) => {
  return profile.id === tenantId
}