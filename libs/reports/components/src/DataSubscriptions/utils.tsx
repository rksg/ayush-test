import { getUserName as getUserNameRAI } from '@acx-ui/analytics/utils'
import { get }                           from '@acx-ui/config'
import { getUserName as getUserNameR1 }  from '@acx-ui/user'
import { getIntl }                       from '@acx-ui/utils'
export function generateBreadcrumb ({ isRAI, isList }: { isRAI?: boolean, isList?: boolean }) {
  const { $t } = getIntl()

  // R1 menu not confirmed to be adjusted later
  const breadcrumb = isRAI ? [
    { text: $t({ defaultMessage: 'Business Insights' }) },
    { text: $t({ defaultMessage: 'DataSubscriptions' }), link: '/dataSubscriptions' }
  ]: [
    { text: $t({ defaultMessage: 'Network Control' }) },
    { text: $t({ defaultMessage: 'My Services' }), link: '/services/list' }
  ]
  if (!isRAI && !isList) {
    breadcrumb.push({
      text: $t({ defaultMessage: 'DataSubscriptions' }),
      link: '/services/dataSubscriptions/list'
    })
  }

  return breadcrumb
}

export const getUserName = () =>
  get('IS_MLISA_SA') ? getUserNameRAI() : getUserNameR1()
