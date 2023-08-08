import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }  from '@acx-ui/analytics/utils'
import { Loader, Card, NoActiveData } from '@acx-ui/components'
import { useRecommendationListQuery } from '../../services'
import * as UI                        from '../styledComponents'

export { AIOperationsWidget as AIOperations }

type AIOperationsProps = {
  filters: AnalyticsFilter
}

function AIOperationsWidget ({
  filters
}: AIOperationsProps) {
  const intl = useIntl()
  const queryResults = useRecommendationListQuery(filters)
  const { $t } = intl
  const title = $t({ defaultMessage: 'AI Operations' })
  const noData = $t({ defaultMessage:
    'When your network becomes active, we will have valuable insights for you here' })

  console.log('queryResults', queryResults)
  
  return <Loader states={[queryResults]}>
    <Card title={title} >
      <AutoSizer>
        {({ width, height }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No recommendations' })} />
            : <UI.Wrapper
              style={{ width, height: height - 20 * 2, marginBlock: 20 }}
              // children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default AIOperationsWidget
