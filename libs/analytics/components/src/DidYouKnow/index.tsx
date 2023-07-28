import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }  from '@acx-ui/analytics/utils'
import { Loader, Carousel } from '@acx-ui/components'

import { getFactsData } from './facts'
import {
  useFactsQuery
} from './services'

export { DidYouKnowWidget as DidYouKnow }

type DidYouKnowWidgetProps = {
  filters: AnalyticsFilter
  maxFactPerSlide: number
  maxSlideChar: number
}

function DidYouKnowWidget ({
  filters,
  maxFactPerSlide,
  maxSlideChar
}: DidYouKnowWidgetProps) {
  const intl = useIntl()
  const queryResults = useFactsQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getFactsData(data!, { maxFactPerSlide, maxSlideChar }),
      ...rest
    })
  })
  const { $t } = intl
  const title = $t({ defaultMessage: 'Did you know?' })
  const subTitle = $t({ defaultMessage: 'No data to report' })
  const noData = $t({ defaultMessage:
    'When your network becomes active, we will have valuable insights for you here' })

  const props = {
    dots: { className: 'carousel-dots' },
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000
  }
  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          queryResults.data.length ?
            <Carousel contentList={queryResults.data}
              title={title}
              {...props}
              classList='carousel-card'
              style={{ height, width }} ></Carousel>

            : <Carousel contentList={[[noData]]}
              title={title}
              subTitle={subTitle}
              classList='carousel-card no-data'
              {...props}
              style={{ height, width }}></Carousel>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default DidYouKnowWidget
