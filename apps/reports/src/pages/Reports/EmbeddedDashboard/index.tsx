import { useEffect, useState } from 'react'

import { Buffer } from 'buffer'

import { embedDashboard } from '@superset-ui/embedded-sdk'

import { Loader }                                    from '@acx-ui/components'
import { useDateFilter, convertDateTimeToSqlFormat } from '@acx-ui/utils'

import { useGuestTokenMutation, useEmbeddedIdMutation } from '../Services'

interface ReportProps {
  embedDashboardName: string
}

function Report (props: ReportProps) {
  const { embedDashboardName } = props
  const [ guestToken ] = useGuestTokenMutation()
  const [ embeddedId ] = useEmbeddedIdMutation()
  const { startDate, endDate } = useDateFilter()
  const [dashboardEmbeddedId, setDashboardEmbeddedId] = useState<string | null>(null)

  const HOST_NAME = process.env['NODE_ENV'] === 'development' ?
    'https://alto.local.mlisa.io' : window.location.origin
    // Change the url above for superset local dev (docker-compose) setup
    // Ex: http://localhost:8088

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
      clause: `"__time" >= '${convertDateTimeToSqlFormat(startDate)}' AND
              "__time" < '${convertDateTimeToSqlFormat(endDate)}'`
    }]
  }

  const fetchGuestTokenFromBackend = async () => {
    // eslint-disable-next-line no-console
    console.log('%c[%s][ACX] -> Refreshing guest token for Embedded Report',
      'color: cyan', new Date().toLocaleString())
    return await guestToken({ payload: guestTokenPayload }).unwrap()
  }

  /**
   * Based on the deployement, change supersetDomain accordingly
   * some examples below
   * supersetDomain: 'http://localhost:49827/analytics/explorer',
   * supersetDomain: 'https://local.mlisa.io/analytics/explorer',
   * supersetDomain: 'http://34.173.141.78:8088',
   * supersetDomain: 'http://localhost:9000',
   */
  useEffect(()=> {
    window.Buffer = Buffer
    if (dashboardEmbeddedId && dashboardEmbeddedId.length > 0) {
      embedDashboard({
        id: dashboardEmbeddedId,
        supersetDomain: `${HOST_NAME}/api/a4rc/explorer`,
        mountPoint: document.getElementById('acx-report')!,
        fetchGuestToken: () => fetchGuestTokenFromBackend(),
        dashboardUiConfig: { hideChartControls: true, hideTitle: true }
        // debug: true
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[startDate, endDate, dashboardEmbeddedId])

  return (
    <Loader>
      <div id='acx-report' />
    </Loader>
  )
}

export default Report
