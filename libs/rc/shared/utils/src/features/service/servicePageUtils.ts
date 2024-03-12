import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { useLocation, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                    from '@acx-ui/utils'

import { LocationExtended }                                                               from '../../common'
import { CONFIG_TEMPLATE_LIST_PATH, generateConfigTemplateBreadcrumb, useConfigTemplate } from '../../configTemplate'
import { ServiceType }                                                                    from '../../constants'
import { generatePageHeaderTitle }                                                        from '../../pages'

import { serviceTypeLabelMapping }                                        from './contentsMap'
import { ServiceOperation, getServiceListRoutePath, getServiceRoutePath } from './serviceRouteUtils'



// eslint-disable-next-line max-len
export function generateServicePageHeaderTitle (isEdit: boolean, isTemplate: boolean, serviceType: ServiceType) {
  const { $t } = getIntl()
  return generatePageHeaderTitle({
    isEdit,
    isTemplate,
    instanceLabel: $t(serviceTypeLabelMapping[serviceType])
  })
}

export function useServiceListBreadcrumb (type: ServiceType) {
  const { isTemplate } = useConfigTemplate()
  const fallbackPath = getServiceRoutePath({ type, oper: ServiceOperation.LIST })
  const { $t } = useIntl()
  const breadcrumb = useMemo(() => {
    return isTemplate
      ? generateConfigTemplateBreadcrumb()
      : [
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'My Services' }),
          link: getServiceListRoutePath(true)
        },
        { text: $t(serviceTypeLabelMapping[type]), link: fallbackPath }
      ]
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
