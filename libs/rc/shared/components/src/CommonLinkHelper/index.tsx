import { useGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
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

// eslint-disable-next-line max-len
export function IdentityGroupLink (props: {
  personaGroupId?: string,
  name?: string,
  enableFetchName?: boolean,
  showNoData?: boolean,
  disableLink?: boolean
}) {
  // eslint-disable-next-line max-len
  const { personaGroupId, name, enableFetchName = false, showNoData = false, disableLink = false } = props
  const { data: groupData, isLoading } = useGetPersonaGroupByIdQuery(
    { params: { groupId: personaGroupId } },
    { skip: !personaGroupId || !enableFetchName })
  // eslint-disable-next-line max-len
  const displayString = name ?? (enableFetchName ? groupData?.name ?? personaGroupId : personaGroupId)

  return (
    personaGroupId
      ? (enableFetchName && isLoading)
        ? <></>
        : disableLink
          ? <>{displayString}</>
          : <TenantLink to={`users/identity-management/identity-group/${personaGroupId}`}>
            {displayString}
          </TenantLink>
      : <>{showNoData && noDataDisplay}</>
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

export function CertTemplateLink (props: {
  id?: string,
  name?: string,
  showNoData?: boolean
}) {
  const { id, name, showNoData } = props
  return (
    id
      ? <TenantLink to={getPolicyDetailsLink({
        policyId: id,
        oper: PolicyOperation.DETAIL,
        type: PolicyType.CERTIFICATE_TEMPLATE
      })}>
        {name ?? id}
      </TenantLink>
      : <>{showNoData && noDataDisplay}</>
  )
}

export function PolicySetLink (props: {
  id?: string,
  name?: string,
  showNoData?: boolean
}) {
  const { id, name, showNoData } = props
  return (
    id
      ? <TenantLink to={getPolicyDetailsLink({
        policyId: id,
        oper: PolicyOperation.DETAIL,
        type: PolicyType.ADAPTIVE_POLICY_SET
      })}>
        {name ?? id}
      </TenantLink>
      : <>{showNoData && noDataDisplay}</>
  )
}

export function NetworkSegmentationLink (props: {
  id?: string,
  name?: string,
  showNoData?: boolean
}) {
  const { id, name, showNoData } = props
  return (
    id
      ? <TenantLink to={getServiceDetailsLink({
        serviceId: id,
        oper: ServiceOperation.DETAIL,
        type: ServiceType.PIN
      })}>
        {name ?? id}
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

export const ResidentPortalLink = (props: { id?: string, name?: string }) => {
  const { id, name } = props
  return (
    <TenantLink to={getServiceDetailsLink({
      type: ServiceType.RESIDENT_PORTAL,
      oper: ServiceOperation.DETAIL,
      serviceId: id!
    })}>
      {name ?? id}
    </TenantLink>
  )
}
