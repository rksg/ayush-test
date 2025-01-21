import { getIntl } from '@acx-ui/utils'

export function generateBreadcrumb ({ isRAI, isList }: { isRAI?: boolean, isList?: boolean }) {
  const { $t } = getIntl()

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