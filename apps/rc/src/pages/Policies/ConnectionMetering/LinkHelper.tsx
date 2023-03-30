
import {
  getPolicyDetailsLink, PolicyOperation, PolicyType
} from '@acx-ui/rc/utils'
import {
  TenantLink
} from '@acx-ui/react-router-dom'

export function ConnectionMeteringLink (props:{ id?: string, name?: string }) {
  const { id, name } = props
  return (
    <TenantLink to={getPolicyDetailsLink({ type: PolicyType.CONNECTION_METERING,
      oper: PolicyOperation.DETAIL, policyId: id ?? '' })}>
      {name ?? id}
    </TenantLink>
  )
}

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