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
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'


export function VenueLink (props: { venueId?: string, name?: string }) {
  const { venueId, name } = props
  return (
    venueId
      ? <TenantLink to={`venues/${venueId}/venue-details/overview`}>
        {name ?? venueId}
      </TenantLink>
      : <>{noDataDisplay}</>
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
      : <>{noDataDisplay}</>
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
      : <>{noDataDisplay}</>
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
      : <>{noDataDisplay}</>
  )
}

export function PropertyUnitLink (props: { venueId?: string, unitId?: string, name?: string }) {
  const { venueId, unitId, name } = props
  return (
    (venueId && unitId)
      ? <TenantLink
        to={`venues/${venueId}/venue-details/units`}
      >
        {name ?? unitId}
      </TenantLink>
      : <>{noDataDisplay}</>
  )
}

export function ConnectionMeteringLink (props:{ id?: string, name?: string }) {
  const { id, name } = props
  return (
    <TenantLink to={getPolicyDetailsLink({ type: PolicyType.CONNECTION_METERING,
      oper: PolicyOperation.DETAIL, policyId: id ?? '' })}>
      {name ?? id}
    </TenantLink>
  )
}
