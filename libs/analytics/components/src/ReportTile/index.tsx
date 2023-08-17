import { useCallback, useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { useAnalyticsFilter }           from '@acx-ui/analytics/utils'
import {  Loader }                      from '@acx-ui/components'
import { noDataDisplay, useDateFilter } from '@acx-ui/utils'

import { useNetworkSummaryInfoQuery }                        from './services'
import { ReportTileWrapper, Tile, TileContent, TileWrapper } from './styledComponents'

export const ReportTile = () => {
  const { $t } = useIntl()

  const [ selected, setSelected ] = useState<number>(0)
  const timer = useRef<ReturnType<typeof setInterval>>()

  const { startDate, endDate } = useDateFilter()
  const { path } = useAnalyticsFilter()
  const queryResults = useNetworkSummaryInfoQuery({ path, startDate, endDate })

  const startTimer = useCallback((interval: number, numOfTile: number) => {
    timer.current && clearInterval(timer.current)
    timer.current = setInterval(()=>{
      setSelected((selected) => (selected + 1) % numOfTile)
    }, interval * 1000)
  }, [])

  useEffect(() => {
    queryResults.data?.length && startTimer(2, queryResults.data?.length)
    return () => timer.current && clearInterval(timer.current)
  }, [queryResults.data?.length])

  const currentTile = queryResults.data?.[selected]!
  return <Loader states={[queryResults]}>{
    queryResults.data
      ? <ReportTileWrapper>
        <TileWrapper>{
          queryResults.data?.map(({ key }, index) => {
            return <Tile
              key={key}
              selected={index === (selected)}
              onClick={() => {
                setSelected(index)
                queryResults.data?.length && startTimer(5, queryResults.data?.length)
              }}
            />
          })
        }</TileWrapper>
        <TileContent // TODO: add link to report
          title={$t(currentTile.text)}
          value={currentTile.value
            ? (currentTile.format?.(currentTile.value) || currentTile.value)
            : noDataDisplay
          }/>
      </ReportTileWrapper>
      : null
  }
  </Loader>
}
