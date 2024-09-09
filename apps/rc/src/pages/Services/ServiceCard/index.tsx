import { ReactNode } from 'react'

import { omit }                                     from 'lodash'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { RadioCard, RadioCardProps } from '@acx-ui/components'
import {
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  serviceTypeDescMapping,
  serviceTypeLabelMapping,
  hasServicePermission
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                               from '@acx-ui/types'

export type ServiceCardProps = Pick<RadioCardProps, 'type' | 'categories'> & {
  serviceType: ServiceType
  count?: number
  helpIcon?: ReactNode
}

export function ServiceCard (props: ServiceCardProps) {
  const { $t } = useIntl()
  const location = useLocation()
  const { serviceType, type: cardType, categories = [], count, helpIcon } = props
  // eslint-disable-next-line max-len
  const linkToCreate = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.CREATE }))
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink(getServiceRoutePath({ type: serviceType, oper: ServiceOperation.LIST }))
  const navigate = useNavigate()

  const isAddButtonAllowed = () => {
    if (cardType !== 'button') return false

    return hasServicePermission({
      type: serviceType,
      oper: ServiceOperation.CREATE,
      roles: [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
    })
  }

  const formatServiceName = () => {
    const name = $t(serviceTypeLabelMapping[serviceType])
    const msgValues = {
      name,
      count,
      helpIcon: () => {
        return helpIcon ? <span style={{ marginLeft: '5px' }}>{helpIcon}</span> : ''
      }
    }

    return count === undefined
      ? <FormattedMessage
        defaultMessage='{name}<helpIcon></helpIcon>'
        values={omit(msgValues, 'count')}
      />
      : <FormattedMessage
        defaultMessage='{name} ({count})<helpIcon></helpIcon>'
        values={msgValues}
      />
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
    />
  )
}
