import { getIntl } from '@acx-ui/utils'

export function generateBreadcrumb () {
  const { $t } = getIntl()

  return [
    { text: $t({ defaultMessage: 'Business Insights' }) },
    { text: $t({ defaultMessage: 'DataSubscriptions' }), link: '/dataSubscriptions' }
  ]
}