import { ReactNode } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { RadioCard, RadioCardProps }                                                         from '@acx-ui/components'
import { getUnifiedServiceRoute, ExtendedUnifiedService, hasUnifiedServiceCreatePermission } from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink }                                           from '@acx-ui/react-router-dom'

import { RadioCardWrapper } from './styledComponents'

export type UnifiedServiceCardProps = Pick<RadioCardProps, 'type'> & {
  unifiedService: ExtendedUnifiedService
  helpIcon?: ReactNode
}

export function UnifiedServiceCard (props: UnifiedServiceCardProps) {
  const { $t } = useIntl()
  const location = useLocation()
  const { unifiedService, type: cardType, helpIcon } = props
  const linkToCreate = useTenantLink(getUnifiedServiceRoute(unifiedService, 'create'))
  const linkToList = useTenantLink(unifiedService.route)
  const navigate = useNavigate()

  const isAddButtonAllowed = () => {
    if (cardType !== 'button') return false

    return hasUnifiedServiceCreatePermission(unifiedService)
  }

  const formatServiceName = () => {
    const name = unifiedService.label

    if (unifiedService.totalCount === undefined) {
      return name
    }
    return $t({ defaultMessage: '{name} ({count})' }, { name, count: unifiedService.totalCount })
  }

  return (<RadioCardWrapper $readonly={unifiedService.readonly}>
    <RadioCard
      type={cardType}
      buttonText={isAddButtonAllowed()
        ? defineMessage({ defaultMessage: 'Add' })
        : undefined
      }
      key={unifiedService.type}
      value={unifiedService.type}
      title={formatServiceName()}
      description={unifiedService.description ?? ''}
      categories={unifiedService.products}
      categoryDisplayMode='icon'
      onClick={() => {
        if (unifiedService.readonly) return

        if (isAddButtonAllowed()) {
          navigate(linkToCreate, { state: { from: location } })
        } else if (cardType === 'default') {
          navigate(linkToList)
        }
      }}
      helpIcon={helpIcon ? <span style={{ marginLeft: '5px' }}>{helpIcon}</span> : ''}
      isBetaFeature={unifiedService.isBetaFeature}
    />
  </RadioCardWrapper>
  )
}
