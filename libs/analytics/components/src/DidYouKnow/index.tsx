import { useCallback, useEffect, useMemo, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Loader, Carousel }                 from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import type { DashboardFilter, PathFilter } from '@acx-ui/utils'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import {
  useAvailableFactsQuery,
  useFactsQuery
} from './services'

export { DidYouKnowWidget as DidYouKnow }

type DidYouKnowWidgetProps = {
  filters: PathFilter | DashboardFilter
}
export const getCarouselFactsMap = (facts: string[]) => {
  let map: Record<number, { facts: string[] }> = {}
  for (let i = 0; i < facts.length; i += 2) {
    map[i / 2 + 1] = { facts: facts.slice(i, i + 2) }
  }
  return map
}

function DidYouKnowWidget ({ filters }: DidYouKnowWidgetProps) {
  const intl = useIntl()
  const [offset, setOffset] = useState(0)
  const [loaded, setLoaded] = useState<string[]>([])
  const [content, setContent] = useState<Record<string, string>>({})
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const factListQuery = useAvailableFactsQuery(filters)
  const factsList = factListQuery.data
  const factsQuery = useFactsQuery(factsList, loaded, offset, filters)

  useEffect(() => {
    if (factsQuery.isUninitialized || factsQuery.isFetching) return
    if (factsQuery.data) {
      setContent((content) => ({ ...content, ...factsQuery.data }))
      setLoaded((loaded) => Array.from(new Set([...loaded, ...factsList![offset]!])))
    }
  }, [offset, factsList, factsQuery])

  useEffect(() => {
    if (filters) {
      setLoaded([])
      setContent({})
      setOffset(0)
    }
  }, [filters])

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

  const page = factsList && (factsList[offset] ?? [])
  const dataLoaded = page?.every(key => loaded.includes(key))
  const hasData = dataLoaded && page?.map(key => content[key]).filter(Boolean).length

  const contentList = !_.isEmpty(factsList)
    ? factsList!.map((facts) => facts.map(key => content[key]).filter(Boolean))
    : [[]]

  const onChange = useCallback((_: number, nextSlide: number) => {
    setOffset(nextSlide)
  }, [])

  useTrackLoadTime({
    itemName: widgetsMapping.DID_YOU_KNOW,
    states: [factsQuery, factListQuery],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[factsQuery, factListQuery]}>
      <AutoSizer>
        {({ height, width }) => (
          <Carousel contentList={contentList}
            title={title}
            subTitle={!hasData && dataLoaded ? subTitle : undefined}
            {...carouselProps}
            classList={'carousel-card'}
            beforeChange={onChange}
            offset={offset}
            style={{ height, width }}
          />
        )}
      </AutoSizer>
    </Loader>
  )
}

export default DidYouKnowWidget
