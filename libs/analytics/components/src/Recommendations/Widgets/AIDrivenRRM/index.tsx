import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }  from '@acx-ui/analytics/utils'
import { Loader, Card, NoActiveData } from '@acx-ui/components'
import { useRecommendationListQuery } from '../../services'
import * as UI                                from '../styledComponents'

export { AIDrivenRRMWidget as AIDrivenRRM }

type AIDrivenRRMProps = {
  filters: AnalyticsFilter
}

function AIDrivenRRMWidget ({
  filters
}: AIDrivenRRMProps) {
  const intl = useIntl()
  const queryResults = useRecommendationListQuery(filters)
  const { $t } = intl
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const subTitle = $t({ defaultMessage: `AI-Driven RRM has been run on 'n' zones and already 'n1/n' have been optimized` })
  const noData = $t({ defaultMessage:
    'When your network becomes active, we will have valuable insights for you here' })

  console.log('queryResults', queryResults)
  
  return <Loader states={[queryResults]}>
    <Card title={title} subTitle={subTitle}>
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

export default AIDrivenRRMWidget
