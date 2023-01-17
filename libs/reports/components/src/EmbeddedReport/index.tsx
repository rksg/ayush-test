import { useEffect, useState } from 'react'

import { embedDashboard, EmbeddedDashboard } from '@superset-ui/embedded-sdk'

import { getSupersetRlsClause } from '@acx-ui/analytics/components'
import {
  RadioBand,
  Loader
} from '@acx-ui/components'
import { useGuestTokenMutation, useEmbeddedIdMutation, BASE_RELATIVE_URL } from '@acx-ui/reports/services'
import { useReportsFilter }                                                from '@acx-ui/reports/utils'
import { useDateFilter, convertDateTimeToSqlFormat }                       from '@acx-ui/utils'


interface ReportProps {
  embedDashboardName: string
  rlsClause?: string
}

export function EmbeddedReport (props: ReportProps) {
  const { embedDashboardName, rlsClause } = props
  const [ guestToken ] = useGuestTokenMutation()
  const [ embeddedId ] = useEmbeddedIdMutation()
  const { startDate, endDate } = useDateFilter()
  const [dashboardEmbeddedId, setDashboardEmbeddedId] = useState<string | null>(null)
  const { filters: { paths, bands } } = useReportsFilter()
  const { networkClause, radioBandClause } = getSupersetRlsClause(paths,bands as RadioBand[])

  // Hostname - Backend service where superset is running.
  // For developement use https://devalto.ruckuswireless.com', for devalto.
  // If using devalto, ensure the Cookie value is passed using modheader.
  // This step is required, as the iframe requests is not proxied locally
  // TODO: Add local proxy to handle iframe requests
  const HOST_NAME = process.env['NODE_ENV'] === 'development'
    ? 'https://devalto.ruckuswireless.com' // Dev
    : window.location.origin // Production

  useEffect(() => {
    const embeddedData = {
      allowed_domains: [HOST_NAME],
      dashboard_title: embedDashboardName
    }
    embeddedId({ payload: embeddedData }).unwrap().then(uuid => setDashboardEmbeddedId(uuid))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedDashboardName])

  const guestTokenPayload = {
    user: {},
    resources: [{
      type: 'dashboard',
      id: dashboardEmbeddedId
    }],
    rls: [{
      clause: `
        "__time" >= '${convertDateTimeToSqlFormat(startDate)}' AND
        "__time" < '${convertDateTimeToSqlFormat(endDate)}'
        ${networkClause}
        ${radioBandClause}
        ${rlsClause? ' AND ' + rlsClause: ''}
      `
    }]
  }

  const fetchGuestTokenFromBackend = async () => {
    // eslint-disable-next-line no-console
    console.log('%c[%s][ACX] -> Refreshing guest token for %s EmbeddedReport',
      'color: cyan', new Date().toLocaleString(), embedDashboardName)
    return await guestToken({ payload: guestTokenPayload }).unwrap()
  }

  useEffect(()=> {
    let timer: ReturnType<typeof setInterval> | null = null
    let embeddedObj :Promise<EmbeddedDashboard> | null = null
    if (dashboardEmbeddedId && dashboardEmbeddedId.length > 0) {
      embeddedObj = embedDashboard({
        id: dashboardEmbeddedId,
        supersetDomain: `${HOST_NAME}${BASE_RELATIVE_URL}`,
        mountPoint: document.getElementById('acx-report')!,
        fetchGuestToken: () => fetchGuestTokenFromBackend(),
        dashboardUiConfig: { hideChartControls: true, hideTitle: true }
        // debug: true
      })
      embeddedObj.then( async embObj =>{
        timer = setInterval(async () => {
          const { height } = await embObj.getScrollSize()
          const iframeElement = document.querySelector('iframe')
          if(iframeElement){
            iframeElement.setAttribute('style', `height: ${height}px !important`)
          }
        }, 1000)
      })
    }
    return () => {
      if(timer) clearTimeout(timer)
      if(embeddedObj) embeddedObj.then(embObj =>{
        // eslint-disable-next-line no-console
        console.log('%c[ACX] -> Unmounting %s EmbeddedReport', 'color: cyan', embedDashboardName)
        embObj.unmount()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[startDate, endDate, paths, bands, dashboardEmbeddedId])

  return (
    <Loader>
      <div id='acx-report' />
    </Loader>
  )
}
