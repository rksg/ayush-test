import { useCallback, useEffect, useMemo, useState } from 'react'

import { isEqual, isEmpty } from 'lodash'
import { useIntl }          from 'react-intl'
import AutoSizer            from 'react-virtualized-auto-sizer'

import { Loader, Carousel }                 from '@acx-ui/components'
import type { DashboardFilter, PathFilter } from '@acx-ui/utils'

import { factsConfig } from './facts'
import {
  useFactsQuery
} from './services'


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
      maxFactPerSlide, maxSlideChar, carouselFactsMap, content, offset, filters
    )
  useEffect(() => {
    if (data && isSuccess && !isFetching) {
      const updatedContent = [...content]
      updatedContent[offset] = data?.[0] ?? []
      setContent(updatedContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, isSuccess, isFetching])
  useEffect(() => {
    if (content[offset]?.length === 0) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])
  useEffect(() => {
    if (filters) {
      setContent(Array.from({ length: 5 }, () => []))
      setOffset(0)
    }
  }, [filters])
  useEffect(() => {
    if (initialLoadedFacts && availableFacts && isEmpty(carouselFactsMap)) {
      const newMap = getCarouselFactsMap(availableFacts.filter((item) =>
        !initialLoadedFacts.includes(item as keyof typeof factsConfig)))
      newMap[0] = { facts: initialLoadedFacts }
      if (!isEqual(carouselFactsMap, newMap)) {
        setCarouselFactsMap(newMap)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoadedFacts])
  const { $t } = intl
  const title = $t({ defaultMessage: 'Did you know?' })
  const subTitle = $t({ defaultMessage: 'No data to report' })
  const carouselProps = useMemo(() => ({
    dots: { className: 'carousel-dots' },
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false
  }), [])

  const onChange = useCallback((_: number, nextSlide: number) => {
    setOffset(nextSlide)
  }, [])

  return (
    <Loader states={[{ isLoading: isFetching || isLoading }]}>
      <AutoSizer>
        {({ height, width }) => (
          <Carousel contentList={content}
            title={title}
            subTitle={!content[offset]?.length ? subTitle : undefined}
            {...carouselProps}
            classList={'carousel-card'}
            beforeChange={onChange}
            offset={offset}
            style={{ height, width }} ></Carousel>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default DidYouKnowWidget
