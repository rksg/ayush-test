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


export function VenueLink (props: { venueId?: string, name?: string, showNoData?: boolean }) {
  const { venueId, name, showNoData } = props
  return (
    venueId
      ? <TenantLink to={`venues/${venueId}/venue-details/overview`}>
        {name ?? venueId}
      </TenantLink>
      : <>{ showNoData && noDataDisplay}</>
  )
}

export function IdentityGroupLink (props: { personaGroupId?: string, name?: string }) {
  const { personaGroupId, name } = props
  return (
    <TenantLink to={`users/identity-management/identity-group/${personaGroupId}`}>
      {name ?? personaGroupId}
    </TenantLink>
  )
}

export function IdentityDetailsLink (
  props: {
    personaGroupId?: string,
    personaId?: string,
    name?: string })
{
  const { personaGroupId, personaId, name } = props
  return (
    <TenantLink
      to={`users/identity-management/identity-group/${personaGroupId}/identity/${personaId}`}
    >
      {name ?? personaId}
    </TenantLink>
  )
}

export function DpskPoolLink (props: { dpskPoolId?: string, name?: string, showNoData?: boolean }) {
  const { dpskPoolId, name, showNoData } = props
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
      : <>{showNoData && noDataDisplay}</>
  )
}

export function MacRegistrationPoolLink (props: {
  macRegistrationPoolId?: string,
  name?: string,
  showNoData?: boolean
}) {
  const { macRegistrationPoolId, name, showNoData } = props
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
      : <>{showNoData && noDataDisplay}</>
  )
}

export function NetworkSegmentationLink (props: {
  nsgId?: string,
  name?: string,
  showNoData?: boolean
}) {
  const { nsgId, name, showNoData } = props
  return (
    nsgId
      ? <TenantLink to={getServiceDetailsLink({
        serviceId: nsgId,
        oper: ServiceOperation.DETAIL,
        type: ServiceType.NETWORK_SEGMENTATION
      })}>
        {name ?? nsgId}
      </TenantLink>
      : <>{showNoData && noDataDisplay}</>
  )
}

export function PropertyUnitLink (props: {
  venueId?: string,
  unitId?: string,
  name?: string,
  showNoData?: boolean
}) {
  const { venueId, unitId, name, showNoData } = props
  return (
    (venueId && unitId)
      ? <TenantLink
        to={`venues/${venueId}/venue-details/units`}
      >
        {name ?? unitId}
      </TenantLink>
      : <>{showNoData && noDataDisplay}</>
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
