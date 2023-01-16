import { defineMessage, useIntl } from 'react-intl'

import { RadioCard, RadioCardProps }                          from '@acx-ui/components'
import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                         from '@acx-ui/react-router-dom'

import { serviceTypeDescMapping, serviceTypeLabelMapping } from '../contentsMap'

export type ServiceCardProps = Pick<RadioCardProps, 'type' | 'categories'> & {
  serviceType: ServiceType
  count?: number
}

export function ServiceCard (props: ServiceCardProps) {
  const { $t } = useIntl()
  const { serviceType, type: cardType, categories, count } = props
  // eslint-disable-next-line max-len
  const linkToCreate = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.CREATE }))
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.LIST }))
  const navigate = useNavigate()

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
      buttonText={cardType === 'button' ? defineMessage({ defaultMessage: 'Add' }) : undefined}
      key={serviceType}
      value={serviceType}
      title={formatServiceName()}
      description={$t(serviceTypeDescMapping[serviceType])}
      categories={categories}
      onClick={() => {
        if (cardType === 'button') {
          navigate(linkToCreate)
        } else if (cardType === 'default') {
          navigate(linkToList)
        }
      }}
    />
  )
}
