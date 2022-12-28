import { useIntl } from 'react-intl'

import { Button, Card }                                                          from '@acx-ui/components'
import { TechnologyLabel }                                                       from '@acx-ui/rc/components'
import { getServiceRoutePath, ServiceOperation, ServiceTechnology, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink }                                                            from '@acx-ui/react-router-dom'

import { serviceTypeDescMapping, serviceTypeLabelMapping } from '../contentsMap'

import * as UI from './styledComponents'

export enum ServiceCardMode {
  SELECT,
  ADD,
  LIST
}

export interface ServiceCardProps {
  type: ServiceType
  technology: ServiceTechnology
  count?: number
  action: ServiceCardMode
}

export function ServiceCard (props: ServiceCardProps) {
  const { $t } = useIntl()
  const { type, technology, count, action: mode } = props

  const formatServiceName = () => {
    const name = $t(serviceTypeLabelMapping[type])
    if (!count) {
      return name
    }
    return $t({ defaultMessage: '{name} ({count})' }, { name, count })
  }

  return (
    <Card title={formatServiceName()}>
      <UI.DescriptionContainer>
        {$t(serviceTypeDescMapping[type])}
      </UI.DescriptionContainer>
      <UI.FooterRow>
        <TechnologyLabel technology={technology} />
        {/* TODO
        {mode === ServiceCardMode.SELECT &&
        } */}
        {mode === ServiceCardMode.ADD &&
          <TenantLink to={getServiceRoutePath({ type, oper: ServiceOperation.CREATE })} key='add'>
            <Button type='secondary'>{$t({ defaultMessage: 'Add' })}</Button>
          </TenantLink>
        }
        {mode === ServiceCardMode.LIST &&
          // TODO
          <TenantLink to={getServiceRoutePath({ type, oper: ServiceOperation.LIST })} key='add'>
            <Button type='secondary'>{$t({ defaultMessage: 'To List' })}</Button>
          </TenantLink>
        }
      </UI.FooterRow>
    </Card>
  )
}
