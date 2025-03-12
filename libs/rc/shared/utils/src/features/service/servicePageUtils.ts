import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { TenantType, useLocation, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                              from '@acx-ui/types'
import { hasRoles }                               from '@acx-ui/user'
import { getIntl }                                from '@acx-ui/utils'

import { LocationExtended }                                                               from '../../common'
import { CONFIG_TEMPLATE_LIST_PATH, generateConfigTemplateBreadcrumb, useConfigTemplate } from '../../configTemplate'
import { ServiceType, ServiceOperation }                                                  from '../../constants'
import { generatePageHeaderTitle }                                                        from '../../pages'

import { serviceTypeLabelMapping }                      from './contentsMap'
import { getServiceListRoutePath, getServiceRoutePath } from './serviceRouteUtils'


export function useServicePageHeaderTitle (isEdit: boolean, serviceType: ServiceType) {
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()
  return generatePageHeaderTitle({
    isEdit,
    isTemplate,
    instanceLabel: $t(serviceTypeLabelMapping[serviceType])
  })
}

// eslint-disable-next-line max-len
export function useServiceListBreadcrumb (type: ServiceType): { text: string, link?: string, tenantType?: TenantType }[] {
  const { isTemplate } = useConfigTemplate()
  const breadcrumb = useMemo(() => {
    return isTemplate
      ? generateConfigTemplateBreadcrumb()
      : generateServiceListBreadcrumb(type)
  }, [isTemplate])

  return breadcrumb
}

// eslint-disable-next-line max-len
export function useServicePreviousPath (type: ServiceType, oper: ServiceOperation): LocationExtended['state']['from'] {
  const { isTemplate } = useConfigTemplate()
  const regularFallbackPath = useTenantLink(getServiceRoutePath({ type, oper }), 't')
  const templateFallbackPath = useTenantLink(CONFIG_TEMPLATE_LIST_PATH, 'v')
  const fallbackPath = isTemplate ? templateFallbackPath : regularFallbackPath
  const location = useLocation()

  return (location as LocationExtended)?.state?.from ?? { pathname: fallbackPath.pathname }
}

export function generateDpskManagementBreadcrumb () {
  const { $t } = getIntl()
  return [
    {
      text: $t({ defaultMessage: 'DPSK Management' }),
      link: '/users/dpskAdmin'
    }
  ]
}

function generateServicesBreadcrumb () {
  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Network Control' }) },
    {
      text: $t({ defaultMessage: 'My Services' }),
      link: getServiceListRoutePath(true)
    }
  ]
}

function generateServiceListBreadcrumb (type: ServiceType) {
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])

  if (type === ServiceType.DPSK && isDPSKAdmin) return generateDpskManagementBreadcrumb()

  const { $t } = getIntl()
  return [
    ...generateServicesBreadcrumb(),
    {
      text: $t(serviceTypeLabelMapping[type]),
      link: getServiceRoutePath({ type, oper: ServiceOperation.LIST })
    }
  ]
}
