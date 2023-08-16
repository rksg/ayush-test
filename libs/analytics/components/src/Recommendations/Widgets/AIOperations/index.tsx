import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }                        from '@acx-ui/analytics/utils'
import { Loader, Card, NoActiveData }             from '@acx-ui/components'
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
  console.log('aiops data', data)
  // const title = $t({ defaultMessage: 'AI Operations' })
  const title = {
    title: $t({ defaultMessage: 'AI Operations' }),
    icon: <UI.TitleBadge
      children={$t(countFormat, { value: data?.length ?? 0 })}
    />
  }
  const noData = data?.length === 0

  // const Link = (id: string, category: string) => {
  //   return <TenantLink to={`/recommendations/aiOps/${id}`} >
  //     {category}
  //   </TenantLink>
  // }

  const items = data?.slice(0,5).map(props => {
    const { category, priority, updatedAt } = props
    return <UI.Detail>
      <div style={{ display: 'flex' }}>
        <UI.PriorityIcon value={priority}/>
        <span>{category}</span>
        {/* <Link id={id} category={category} /> */}
        {/* <Button></Button> */}
      </div>
      <UI.Subtitle>{formatter(DateFormatEnum.DateFormat)(updatedAt)}</UI.Subtitle>
    </UI.Detail>
  })


  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick}>
      <AutoSizer>
        {({ width, height }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No recommendations' })} />
            : <UI.Wrapper
              style={{ width, height: height - 20 * 2, marginBlock: 20 }}
              children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default AIOperationsWidget
