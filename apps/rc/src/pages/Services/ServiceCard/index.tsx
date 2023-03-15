import { defineMessage, useIntl } from 'react-intl'

import { RadioCard, RadioCardProps } from '@acx-ui/components'
import {
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                               from '@acx-ui/types'
import { hasRoles }                                from '@acx-ui/user'

import { serviceTypeDescMapping, serviceTypeLabelMapping } from '../contentsMap'

export type ServiceCardProps = Pick<RadioCardProps, 'type' | 'categories'> & {
  serviceType: ServiceType
  count?: number
}

export function ServiceCard (props: ServiceCardProps) {
  const { $t } = useIntl()
  const location = useLocation()
  const { serviceType, type: cardType, categories, count } = props
  // eslint-disable-next-line max-len
  const linkToCreate = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.CREATE }))
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.LIST }))
  const navigate = useNavigate()
  const isReadOnly = !hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

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
      buttonText={(cardType === 'button' && !isReadOnly)
        ? defineMessage({ defaultMessage: 'Add' })
        : undefined
      }
      key={serviceType}
      value={serviceType}
      title={formatServiceName()}
      description={$t(serviceTypeDescMapping[serviceType])}
      categories={categories}
      onClick={() => {
        if (cardType === 'button') {
          navigate(linkToCreate, {
            state: {
              from: location
            }
          })
        } else if (cardType === 'default') {
          navigate(linkToList)
        }
      }}
    />
  )
}
