import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'
import { Loader, Carousel }                 from '@acx-ui/components'
import type { DashboardFilter, PathFilter } from '@acx-ui/utils'
import {isEqual} from 'lodash';

import { factsConfig, getFactsData } from './facts'
import {
  useFactsQuery
} from './services'
import { useCallback, useEffect, useMemo, useState } from 'react'

export { DidYouKnowWidget as DidYouKnow }

type DidYouKnowWidgetProps = {
  filters: PathFilter | DashboardFilter
  maxFactPerSlide?: number
  maxSlideChar?: number
}
export const getCarouselFactsMap = (facts: string[]) => {
  let map: Record<number, { facts: string[] }> = {}
  for (let i = 0; i < facts.length; i += 2) {
    map[i / 2 + 1] = { facts: facts.slice(i, i + 2) }
  }
  return map
}

function DidYouKnowWidget ({
  filters,
  maxFactPerSlide,
  maxSlideChar
}: DidYouKnowWidgetProps) {
  const intl = useIntl()
  const [offset, setOffset] = useState(0)
  const [content, setContent] = useState<string[][]>(Array.from({ length: 5 }, () => []))
  const [carouselFactsMap, setCarouselFactsMap] = useState<Record<number, { facts: string[] }>>({})
  const { data, isFetching, refetch, isSuccess, isLoading, initialLoadedFacts, availableFacts } =
    useFactsQuery(
      { ...filters, requestedList: carouselFactsMap?.[offset]?.facts },
      {
        selectFromResult: ({ data, ...rest }) => ({
          data: getFactsData(data?.facts!, { maxFactPerSlide, maxSlideChar }),
          availableFacts: data?.availableFacts,
          initialLoadedFacts: data?.facts.map((fact) => fact.key),
          ...rest,
        }),
        skip: !Boolean(content[offset]?.length === 0),
      }
    )
  useEffect(() => {
    if (data && isSuccess && !isFetching) {
      const updatedContent = [...content]
      updatedContent[offset] = data?.[0] ?? []
      setContent(updatedContent)
    }
  }, [offset, isSuccess, isFetching])
  useEffect(() => {
    if (content[offset]?.length === 0) {
      refetch()
    }
  }, [offset, content, refetch])
  useEffect(() => {
    if (initialLoadedFacts && availableFacts) {
      const newMap = getCarouselFactsMap(availableFacts.filter((item) => !initialLoadedFacts.includes(item as keyof typeof factsConfig)));
      newMap[0] = { facts: initialLoadedFacts };
      if (!isEqual(carouselFactsMap, newMap)) {
        setCarouselFactsMap(newMap);
      }
    }
  }, [initialLoadedFacts]);

  const { $t } = intl
  const title = $t({ defaultMessage: 'Did you know?' })
  const subTitle = $t({ defaultMessage: 'No data to report' })
  const noData = $t({ defaultMessage:
    'When your network becomes active, we will have valuable insights for you here' })

  const carouselProps = useMemo(() => ({
    dots: { className: 'carousel-dots' },
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 10000
  }), []);

  const onChange = useCallback((_: number, nextSlide: number) => {
    setOffset(nextSlide);
  }, []);

  return (
    <Loader states={[{isLoading: isFetching || isLoading}]}>
      <AutoSizer>
        {({ height, width }) => (
            <Carousel contentList={content.length ? content : [[noData]]}
              title={title}
              subTitle={!content[offset].length ? subTitle : undefined}
              {...carouselProps}
              classList={content.length ? 'carousel-card' : 'carousel-card no-data'}
              beforeChange={onChange}
              offset={offset}
              style={{ height, width }} ></Carousel>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default DidYouKnowWidget
