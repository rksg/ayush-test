import { TenantLink } from '@acx-ui/react-router-dom'


export function PersonaGroupLink (props: { personaGroupId?: string, name?: string }) {
  const { personaGroupId, name } = props
  return (
    <TenantLink to={`users/persona-group/${personaGroupId}`}>
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
    <TenantLink to={`users/persona-group/${personaGroupId}/persona/${personaId}`}>
      {name ?? personaId}
    </TenantLink>
  )
}

export function DpskPoolLink (props: { dpskPoolId?: string, name?: string }) {
  const { dpskPoolId, name } = props
  return (
    // not be confirmed
    <TenantLink to={`dpsk/${dpskPoolId}`}>
      {name ?? dpskPoolId}
    </TenantLink>
  )
}

export function MacRegistrationPoolLink (props: { macRegistrationPoolId?: string, name?: string }) {
  const { macRegistrationPoolId, name } = props
  return (
    // not be confirmed
    <TenantLink to={`macRegistrationPool/${macRegistrationPoolId}`}>
      {name ?? macRegistrationPoolId}
    </TenantLink>
  )
}

export function NetworkSegmentationLink (props: { nsgId?: string, name?: string }) {
  const { nsgId, name } = props
  return (
    // not be confirmed
    <TenantLink to={`nsg/${nsgId}`}>
      {name ?? nsgId}
    </TenantLink>
  )
}
