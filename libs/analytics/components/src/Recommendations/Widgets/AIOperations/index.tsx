import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }                        from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, NoData }          from '@acx-ui/components'
import { DateFormatEnum, formatter, intlFormats } from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }          from '@acx-ui/react-router-dom'

import { useRecommendationListQuery } from '../../services'
import * as UI                        from '../styledComponents'

export { AIOperationsWidget as AIOperations }

const { countFormat } = intlFormats

type AIOperationsProps = {
  filters: AnalyticsFilter
}

function AIOperationsWidget ({
  filters
}: AIOperationsProps) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/analytics/recommendations/aiOps')
  const queryResults = useRecommendationListQuery(filters)
  const data = queryResults?.data?.filter((row) =>
    (false === row.code.includes('crrm'))
  )
  const title = {
    title: $t({ defaultMessage: 'AI Operations' }),
    icon: <UI.TitleBadge
      children={$t(countFormat, { value: data?.length ?? 0 })}
    />
  }
  const noData = data?.length === 0

  const items = data?.slice(0,5).map(props => {
    const { category, priority, updatedAt, id, summary, sliceValue } = props
    return <UI.Detail key={id}>
      <UI.FlexDiv>
        <UI.PriorityIcon value={priority} />
        <TenantLink
          to={`/recommendations/aiOps/${id}`}
          style={{ textDecoration: 'none', color: 'var(--acx-primary-black)' }}
        >
          <Tooltip
            placement='top'
            title={$t({ defaultMessage: '{summary} on {sliceValue}' }, { sliceValue, summary })}
          >
            {category}
          </Tooltip>
        </TenantLink>
      </UI.FlexDiv>
      <UI.Subtitle>{formatter(DateFormatEnum.DateFormat)(updatedAt)}</UI.Subtitle>
    </UI.Detail>
  })


  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick}>
      <AutoSizer>
        {({ width }) => (
          noData
            ? <NoData text={$t({ defaultMessage: 'No recommendations' })} />
            : <UI.Wrapper
              style={{ width }}
              children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default AIOperationsWidget
