
import { useContext, useEffect, useState } from 'react'

import { Buffer } from 'buffer'

import { embedDashboard } from '@superset-ui/embedded-sdk'

import { getSupersetRlsClause } from '@acx-ui/analytics/components'
import {
  RadioBand,
  Loader
} from '@acx-ui/components'
import { useDateFilter, convertDateTimeToSqlFormat } from '@acx-ui/utils'

import { NetworkFilterWithBandContext }                                    from '../../../Routes'
import { useGuestTokenMutation, useEmbeddedIdMutation, BASE_RELATIVE_URL } from '../Services'

interface ReportProps {
  embedDashboardName: string
}

function Report (props: ReportProps) {
  const { embedDashboardName } = props
  const [ guestToken ] = useGuestTokenMutation()
  const [ embeddedId ] = useEmbeddedIdMutation()
  const { startDate, endDate } = useDateFilter()
  const [dashboardEmbeddedId, setDashboardEmbeddedId] = useState<string | null>(null)
  const { filterData } = useContext(NetworkFilterWithBandContext)
  const { paths, bands } = filterData
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
      `
    }]
  }

  const fetchGuestTokenFromBackend = async () => {
    // eslint-disable-next-line no-console
    console.log('%c[%s][ACX] -> Refreshing guest token for Embedded Report',
      'color: cyan', new Date().toLocaleString())
    return await guestToken({ payload: guestTokenPayload }).unwrap()
  }

  useEffect(()=> {
    window.Buffer = Buffer
    if (dashboardEmbeddedId && dashboardEmbeddedId.length > 0) {
      embedDashboard({
        id: dashboardEmbeddedId,
        supersetDomain: `${HOST_NAME}${BASE_RELATIVE_URL}`,
        mountPoint: document.getElementById('acx-report')!,
        fetchGuestToken: () => fetchGuestTokenFromBackend(),
        dashboardUiConfig: { hideChartControls: true, hideTitle: true }
        // debug: true
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[startDate, endDate, filterData, dashboardEmbeddedId])

  return (
    <Loader>
      <div id='acx-report' />
    </Loader>
  )
}

export default Report
