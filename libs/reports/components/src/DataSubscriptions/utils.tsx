import { getUserName as getUserNameRAI } from '@acx-ui/analytics/utils'
import { get }                           from '@acx-ui/config'
import { getUserName as getUserNameR1 }  from '@acx-ui/user'
import { getIntl }                       from '@acx-ui/utils'
export function generateBreadcrumb () {
  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Business Insights' }) },
    { text: $t({ defaultMessage: 'DataSubscriptions' }), link: '/dataSubscriptions' }
  ]
}

export const getUserName = () =>
  get('IS_MLISA_SA') ? getUserNameRAI() : getUserNameR1()
