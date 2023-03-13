import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getFactsData } from '@acx-ui/analytics/utils'
import { Loader, Carousel }              from '@acx-ui/components'

import {
  useDidYouKnowQuery
} from './services'

export { DidYouKnowWidget as DidYouKnow }

function DidYouKnowWidget ({
  filters
}: { filters : AnalyticsFilter }) {
  const intl = useIntl()
  const queryResults = useDidYouKnowQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getFactsData(data!, intl),
      ...rest
    })
  })
  const title = intl.$t({ defaultMessage: 'Did you know?' })
  const subTitle = intl.$t({ defaultMessage: 'No data to report' })
  const noData = intl.$t({ defaultMessage:
    'When your network becomes active, we will have valuable insights for you here' })

  const props = {
    dots: { className: 'carousel-dots' },
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true
  }
  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {() => (
          queryResults.data.length ?
            <Carousel contentList={queryResults.data}
              title={title}
              {...props}
              classList='carousel-card'></Carousel>

            : <Carousel contentList={[[noData]]}
              title={title}
              subTitle={subTitle}
              classList='carousel-card no-data'
              {...props}></Carousel>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default DidYouKnowWidget
