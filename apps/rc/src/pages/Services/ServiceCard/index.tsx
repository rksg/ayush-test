import { ReactNode } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { RadioCard, RadioCardProps } from '@acx-ui/components'
import {
  getServiceRoutePath,
  ServiceOperation,
  ServicePolicyScopeKeyOper,
  servicePolicyCardDataToScopeKeys,
  ServiceType,
  serviceTypeDescMapping,
  serviceTypeLabelMapping,
  hasDpskAccess
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum, ScopeKeys }                    from '@acx-ui/types'
import { hasPermission }                           from '@acx-ui/user'

export type ServiceCardProps = Pick<RadioCardProps, 'type' | 'categories'> & {
  serviceType: ServiceType
  count?: number
  scopeKeysMap?: Record<ServicePolicyScopeKeyOper, ScopeKeys>
  isBetaFeature?: boolean
  helpIcon?: ReactNode
}

export function ServiceCard (props: ServiceCardProps) {
  const { $t } = useIntl()
  const location = useLocation()
  // eslint-disable-next-line max-len
  const { serviceType, type: cardType, categories = [], count, scopeKeysMap, helpIcon } = props
  // eslint-disable-next-line max-len
  const linkToCreate = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.CREATE }))
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.LIST }))
  const navigate = useNavigate()

  const isAddButtonAllowed = () => {
    if (cardType !== 'button') return false
    if (serviceType === ServiceType.DPSK) return hasDpskAccess()
    // eslint-disable-next-line max-len
    const scopeKeyForCreate = servicePolicyCardDataToScopeKeys([{ scopeKeysMap, categories }], 'create')
    return hasPermission({
      roles: [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR],
      scopes: scopeKeyForCreate
    })
  }

  const formatServiceName = () => {
    const name = $t(serviceTypeLabelMapping[serviceType])

    if (count === undefined) {
      return name
    }
    return $t({ defaultMessage: '{name} ({count})' }, { name, count })
  }

  return (
    <RadioCard
      type={cardType}
      buttonText={isAddButtonAllowed()
        ? defineMessage({ defaultMessage: 'Add' })
        : undefined
      }
      key={serviceType}
      value={serviceType}
      title={formatServiceName()}
      description={$t(serviceTypeDescMapping[serviceType])}
      categories={categories}
      onClick={() => {
        if (isAddButtonAllowed()) {
          navigate(linkToCreate, { state: { from: location } })
        } else if (cardType === 'default') {
          navigate(linkToList)
        }
      }}
      helpIcon={<span style={{ marginLeft: '5px' }}>{helpIcon}</span>}
    />
  )
}
