
import { Space } from 'antd'

import { PersonaBlockedIcon } from '@acx-ui/icons'
import { TenantLink }         from '@acx-ui/react-router-dom'
import { noDataDisplay }      from '@acx-ui/utils'

import { ServiceOperation, ServiceType }                       from '../../constants'
import { getPolicyDetailsLink, MacRegistrationDetailsTabKey  } from '../../features/policy/policyRouteUtils'
import { getServiceDetailsLink }                               from '../../features/service/serviceRouteUtils'
import { DpskDetailsTabKey }                                   from '../../types'
import { PolicyType, PolicyOperation }                         from '../../types/policies/common'


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
    name?: string,
    disableLink?: boolean,
    revoked?: boolean
  })
{
  const { personaGroupId, personaId, name, disableLink = false, revoked = false } = props
  return <Space align='center' size={2}> {
    disableLink
      ? <>{name}</>
      : <TenantLink
        to={`users/identity-management/identity-group/${personaGroupId}/identity/${personaId}`}
      >
        {name ?? personaId}
      </TenantLink>
  }
  {
    revoked &&
    <PersonaBlockedIcon style={{ height: '16px', width: '16px', marginBottom: '-3px' }} />
  }
  </Space>
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
