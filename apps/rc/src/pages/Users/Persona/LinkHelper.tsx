import {
  DpskDetailsTabKey,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  MacRegistrationDetailsTabKey,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


export function VenueLink (props: { venueId?: string, name?: string }) {
  const { venueId, name } = props
  // FIXME: After the property id does not present in UUID format, I will remove .replace()
  const id = venueId?.replaceAll('-', '')
  return (
    <TenantLink to={`venues/${id}/venue-details/overview`}>
      {name ?? id}
    </TenantLink>
  )
}

export function PersonaGroupLink (props: { personaGroupId?: string, name?: string }) {
  const { personaGroupId, name } = props
  return (
    <TenantLink to={`users/persona-management/persona-group/${personaGroupId}`}>
      {name ?? personaGroupId}
    </TenantLink>
  )
}

export function PersonaDetailsLink (
  props: {
    personaGroupId?: string,
    personaId?: string,
    name?: string })
{
  const { personaGroupId, personaId, name } = props
  return (
    <TenantLink
      to={`users/persona-management/persona-group/${personaGroupId}/persona/${personaId}`}
    >
      {name ?? personaId}
    </TenantLink>
  )
}

export function DpskPoolLink (props: { dpskPoolId?: string, name?: string }) {
  const { dpskPoolId, name } = props
  return (
    dpskPoolId
      ? <TenantLink to={getServiceDetailsLink({
        serviceId: dpskPoolId,
        oper: ServiceOperation.DETAIL,
        type: ServiceType.DPSK,
        activeTab: DpskDetailsTabKey.OVERVIEW
      })}>
        {name ?? dpskPoolId}
      </TenantLink>
      : <></>
  )
}

export function MacRegistrationPoolLink (props: { macRegistrationPoolId?: string, name?: string }) {
  const { macRegistrationPoolId, name } = props
  return (
    macRegistrationPoolId
      ? <TenantLink to={getPolicyDetailsLink({
        policyId: macRegistrationPoolId,
        oper: PolicyOperation.DETAIL,
        type: PolicyType.MAC_REGISTRATION_LIST,
        activeTab: MacRegistrationDetailsTabKey.OVERVIEW
      })}>
        {name ?? macRegistrationPoolId}
      </TenantLink>
      : <></>
  )
}

export function NetworkSegmentationLink (props: { nsgId?: string, name?: string }) {
  const { nsgId, name } = props
  return (
    nsgId
      ? <TenantLink to={getServiceDetailsLink({
        serviceId: nsgId,
        oper: ServiceOperation.DETAIL,
        type: ServiceType.NETWORK_SEGMENTATION
      })}>
        {name ?? nsgId}
      </TenantLink>
      : <></>
  )
}
