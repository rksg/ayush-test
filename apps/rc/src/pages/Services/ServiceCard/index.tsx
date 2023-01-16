import { defineMessage, useIntl } from 'react-intl'

import { RadioCard, RadioCardCategory }                       from '@acx-ui/components'
import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                         from '@acx-ui/react-router-dom'

import { serviceTypeDescMapping, serviceTypeLabelMapping } from '../contentsMap'

export enum ServiceCardMode {
  ADD,
  LIST
}

export interface ServiceCardProps {
  type: ServiceType
  categories?: RadioCardCategory[]
  count?: number
  action: ServiceCardMode
}

export function ServiceCard (props: ServiceCardProps) {
  const { $t } = useIntl()
  const { type, categories, count, action } = props
  const linkToCreate = useTenantLink(getServiceRoutePath({ type, oper: ServiceOperation.CREATE }))
  const linkToList = useTenantLink(getServiceRoutePath({ type, oper: ServiceOperation.LIST }))
  const navigate = useNavigate()

  const formatServiceName = () => {
    const name = $t(serviceTypeLabelMapping[type])
    if (count === undefined) {
      return name
    }
    return $t({ defaultMessage: '{name} ({count})' }, { name, count })
  }

  return (
    <>
      {action === ServiceCardMode.ADD &&
        <RadioCard
          type={'button'}
          buttonText={defineMessage({ defaultMessage: 'Add' })}
          key={type}
          value={type}
          title={formatServiceName()}
          description={$t(serviceTypeDescMapping[type])}
          categories={categories}
          onClick={() => navigate(linkToCreate)}
        />
      }
      {action === ServiceCardMode.LIST &&
        <RadioCard
          type={'default'}
          key={type}
          value={type}
          title={formatServiceName()}
          description={$t(serviceTypeDescMapping[type])}
          categories={categories}
          onClick={() => navigate(linkToList)}
        />
      }
    </>
  )
}
