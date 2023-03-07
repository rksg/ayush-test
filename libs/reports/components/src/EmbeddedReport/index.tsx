import { useEffect, useState } from 'react'

import { embedDashboard, EmbeddedDashboard } from '@superset-ui/embedded-sdk'

import { getSupersetRlsClause } from '@acx-ui/analytics/components'
import {
  RadioBand,
  Loader
} from '@acx-ui/components'
import { convertDateTimeToSqlFormat }                                      from '@acx-ui/formatter'
import { useParams }                                                       from '@acx-ui/react-router-dom'
import { useGuestTokenMutation, useEmbeddedIdMutation, BASE_RELATIVE_URL } from '@acx-ui/reports/services'
import { useReportsFilter }                                                from '@acx-ui/reports/utils'
import { useDateFilter, getJwtToken }                                      from '@acx-ui/utils'

interface ReportProps {
  embedDashboardName: string
  rlsClause?: string
  hideHeader?: boolean
}

export function EmbeddedReport (props: ReportProps) {
  const { embedDashboardName, rlsClause, hideHeader } = props
  const params = useParams()
  const [ guestToken ] = useGuestTokenMutation()
  const [ embeddedId ] = useEmbeddedIdMutation()
  const { startDate, endDate } = useDateFilter()
  const [dashboardEmbeddedId, setDashboardEmbeddedId] = useState<string | null>(null)
  const { filters: { paths, bands } } = useReportsFilter()
  const { networkClause, radioBandClause } = getSupersetRlsClause(paths,bands as RadioBand[])

  /**
  * Hostname - Backend service where superset is running.
  * For developement,
  * Use https://devalto.ruckuswireless.com, for devalto.
  * Use https://alto.local.mlisa.io, for minikube.
  **/
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
    rls: [
      {
        clause: ['"__time"', '>=', `'${convertDateTimeToSqlFormat(startDate)}'`, 'AND',
          '"__time"', '<', `'${convertDateTimeToSqlFormat(endDate)}'`, 'AND',
          `'${params?.tenantId}' = '${params?.tenantId}'`
        ].join(' ')
      },
      ...((networkClause || radioBandClause || rlsClause)
        ? [{
          clause: rlsClause
            ? rlsClause
            : [networkClause.trim(),
              networkClause && radioBandClause
                ? ' AND ' + radioBandClause.trim()
                : radioBandClause].join('')
        }]
        : [])
    ]
  }

  const fetchGuestTokenFromBackend = async () => {
    // eslint-disable-next-line no-console
    console.log('%c[%s][EmbeddedReport] -> Refreshing guest token for [%s]',
      'color: cyan', new Date().toLocaleString(), embedDashboardName)
    return await guestToken({ payload: guestTokenPayload }).unwrap()
  }

  useEffect(()=> {
    let timer: ReturnType<typeof setInterval>
    let embeddedObj :Promise<EmbeddedDashboard>
    const jwtToken = getJwtToken()
    if (dashboardEmbeddedId && dashboardEmbeddedId.length > 0) {
      embeddedObj = embedDashboard({
        id: dashboardEmbeddedId,
        supersetDomain: `${HOST_NAME}${BASE_RELATIVE_URL}`,
        mountPoint: document.getElementById(`acx-report-${embedDashboardName}`)!,
        fetchGuestToken: () => fetchGuestTokenFromBackend(),
        dashboardUiConfig: {
          hideChartControls: true,
          hideTitle: hideHeader ?? true
        },
        // debug: true
        authToken: jwtToken ? `Bearer ${jwtToken}` : undefined
      })
      embeddedObj.then(async embObj =>{
        timer = setInterval(async () => {
          const { height } = await embObj.getScrollSize()
          if (height > 0) {
            const iframeElement = document.querySelector(
              `div[id="acx-report-${embedDashboardName}"] > iframe`)
            if(iframeElement){
              iframeElement.setAttribute('style', `height: ${height}px !important`)
            }
          }
        }, 1000)
      })
    }
    return () => {
      if(timer) clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[startDate, endDate, paths, bands, dashboardEmbeddedId])

  return (
    <Loader>
      <div id={`acx-report-${embedDashboardName}`} className='acx-report' />
    </Loader>
  )
}
