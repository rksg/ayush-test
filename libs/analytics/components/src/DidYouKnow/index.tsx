import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'
import { Loader, Carousel }                 from '@acx-ui/components'
import type { DashboardFilter, PathFilter } from '@acx-ui/utils'

import { getFactsData } from './facts'
import {
  useFactsQuery
} from './services'
import { useEffect, useState } from 'react'
import { off } from 'process'

export { DidYouKnowWidget as DidYouKnow }

type DidYouKnowWidgetProps = {
  filters: PathFilter | DashboardFilter
  maxFactPerSlide?: number
  maxSlideChar?: number
}

const carouselFactsMap: Record<number, {facts : string[]}> = {
  0: {
    facts: ['topIncidentsZones', 'topApplicationsByClients'],
  },
  1: {
    facts: ['topApplicationsByTraffic', 'l3AuthFailure'],
  },
  2: {
    facts: ['busiestSsidByClients', 'busiestSsidByTraffic'],
  },
  3: {
    facts: ['avgSessionDuration', 'userTrafficThroughAPs'],
  },
  4: {
    facts: ['airtimeUtilization'],
  },
};

function DidYouKnowWidget ({
  filters,
  maxFactPerSlide,
  maxSlideChar
}: DidYouKnowWidgetProps) {
  const intl = useIntl()
  const [offset, setOffset] = useState(0);
  const [content, setContent] = useState<any>( Array.from({ length: Math.ceil(Object.values(carouselFactsMap).length)}, () => []));

  const { data, isFetching, refetch, isSuccess } = useFactsQuery({...filters, requestedList : carouselFactsMap[offset].facts}, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getFactsData(data!, { maxFactPerSlide, maxSlideChar }),
      ...rest
    })
  })
  useEffect(() => {
    if (data && isSuccess && !isFetching) {
      content[offset] = data[0]
      setContent(content);
    }
  }, [offset, isSuccess,isFetching]);

  const onChange = (slideNumber: number) => {
    setOffset(slideNumber);
    refetch();
  };
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
    autoplay: false,
    autoplaySpeed: 10000
  }
  return (
    <Loader states={[{isLoading: isFetching}]}>
      <AutoSizer>
        {({ height, width }) => (
            <Carousel contentList={content.length ? content : [[noData]]}
              title={title}
              subTitle={!content.length ? subTitle : undefined}
              {...props}
              classList={content.length ? 'carousel-card' : 'carousel-card no-data'}
              afterChange={onChange}
              offset={offset}
              style={{ height, width }} ></Carousel>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default DidYouKnowWidget
