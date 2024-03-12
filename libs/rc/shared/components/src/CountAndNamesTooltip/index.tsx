import { TooltipPlacement } from 'antd/lib/tooltip'
import { useIntl }          from 'react-intl'

import { Tooltip }                               from '@acx-ui/components'
import { CountAndNames, transformDisplayNumber } from '@acx-ui/rc/utils'
import { TenantLink }                            from '@acx-ui/react-router-dom'


interface CountAndNamesTooltipProps {
    data?: CountAndNames
    maxShow?: number,
    placement?: TooltipPlacement,
    linkUrl?: string,
    dottedUnderline?: boolean
}

export function CountAndNamesTooltip (props: CountAndNamesTooltipProps) {
  const { $t } = useIntl()
  const { data, maxShow = 10, placement, linkUrl='', dottedUnderline } = props
  const { count, names } = data || {}
  const countDisplay = transformDisplayNumber(count)
  const namesLen = (names && names.length) || 0

  const countComponent = (linkUrl: string, countText: number) => (
    linkUrl === '' ?
      <span>{ countText }</span> :
      <TenantLink to={linkUrl}>
        { countText }
      </TenantLink>
  )

  if (names && namesLen > 0) {
    const truncateData = names.slice(0, maxShow-1)

    if (namesLen > maxShow) {
      truncateData.push(
        $t({ defaultMessage: 'And {total} more...' },
          { total: namesLen - maxShow })
      )
    }
    const tootipTitle = truncateData.map(n => <div key={n}>{n}</div>)

    return (
      <Tooltip
        title={tootipTitle}
        placement={placement || 'bottom'}
        dottedUnderline={dottedUnderline}
      >
        { countComponent(linkUrl!, countDisplay) }
      </Tooltip>
    )
  }

  return countComponent(linkUrl!, countDisplay)
}
