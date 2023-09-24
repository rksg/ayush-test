import { useCallback, useEffect, useRef, useState } from 'react'

import { Statistic } from 'antd'
import { useIntl }   from 'react-intl'

import { Card, Loader }                              from '@acx-ui/components'
import { TenantLink }                                from '@acx-ui/react-router-dom'
import { noDataDisplay, useDateFilter, NetworkPath } from '@acx-ui/utils'

import { useNetworkSummaryInfoQuery, tileMap } from './services'
import { ReportTileWrapper, Tile }             from './styledComponents'

export const ReportTile = ({ path }: { path: NetworkPath }) => {
  const { $t } = useIntl()

  const [ selected, setSelected ] = useState<number>(0)
  const timer = useRef<ReturnType<typeof setInterval>>()

  const { startDate, endDate } = useDateFilter()
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

  useEffect(() => setSelected(0), [path])

  const currentTile = queryResults.data?.[selected]

  return <Loader states={[queryResults]}>
    <Card>{queryResults.data
      ? <ReportTileWrapper>
        <div>{
          queryResults.data?.map(({ key }, index) => {
            return <Tile
              key={key}
              role='radio'
              aria-checked={selected === index}
              selected={index === (selected)}
              onClick={() => {
                setSelected(index)
                queryResults.data?.length && startTimer(5, queryResults.data?.length)
              }}
            />
          })
        }</div>
        {currentTile && <TenantLink to={currentTile.url}>
          <Statistic
            title={$t(currentTile.text)}
            value={currentTile.value
              ? tileMap[currentTile.key].format(currentTile.value)
              : noDataDisplay}/>
        </TenantLink>}
      </ReportTileWrapper>
      : null}
    </Card>
  </Loader>
}
