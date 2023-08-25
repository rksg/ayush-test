import { useEffect, useState } from 'react'

import { embedDashboard, EmbeddedDashboard } from '@superset-ui/embedded-sdk'
import moment                                from 'moment'

import { getUserProfile as getUserProfileRA } from '@acx-ui/analytics/utils'
import {
  RadioBand,
  Loader
} from '@acx-ui/components'
import { get }                                          from '@acx-ui/config'
import { useParams }                                    from '@acx-ui/react-router-dom'
import { useGuestTokenMutation, useEmbeddedIdMutation } from '@acx-ui/reports/services'
import { useReportsFilter }                             from '@acx-ui/reports/utils'
import { REPORT_BASE_RELATIVE_URL }                     from '@acx-ui/store'
import { getUserProfile as getUserProfileR1 }           from '@acx-ui/user'
import { useDateFilter, getJwtToken, NetworkPath }      from '@acx-ui/utils'

import { bandDisabledReports, ReportType, reportTypeDataStudioMapping, reportModeMapping } from '../mapping/reportsMapping'

interface ReportProps {
  reportName: ReportType
  rlsClause?: string
  hideHeader?: boolean
}

export function convertDateTimeToSqlFormat (dateTime: string): string {
  return moment.utc(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

export const getSupersetRlsClause = (reportName:ReportType,
  paths?:NetworkPath[],radioBands?:RadioBand[]) => {
  const mode=reportModeMapping[reportName]
  const isApReport = ['ap','both'].includes(mode)
  const isSwitchReport = ['switch','both'].includes(mode)
  const isRadioBandDisabled = bandDisabledReports.includes(reportName)
  let radioBandClause = ''
  let zoneClause = ''
  let apClause = ''
  let switchGroupClause = ''
  let switchClause = ''
  let networkClause = ''

  if(radioBands?.length && isApReport && !isRadioBandDisabled){
    radioBandClause = ` "band" in (${radioBands.map(radioBand=>`'${radioBand}'`).join(', ')})`
  }

  if(paths?.length){
    const zoneIds:string[] = []
    const switchGroupIds:string[] = []
    const apMacs:string[] = []
    const switchMacs:string[]=[]
    paths.forEach(path=>{
      if(path.length === 2 && path[1].type === 'zone'){
        zoneIds.push(`'${path[1].name}'`)
      }
      else if(path.length === 2 && path[1].type === 'switchGroup'){
        switchGroupIds.push(`'${path[1].name}'`)
      }
      else if(path.length === 3 && path[2].type === 'AP'){
        apMacs.push(`'${path[2].name}'`)
      }
      else if(path.length === 3 && path[2].type === 'switch'){
        switchMacs.push(`'${path[2].name}'`)
      }
    })
    if(isApReport){
      if(zoneIds.length){
        zoneClause = `"zoneName" in (${zoneIds.join(', ')})`
      }

      if(apMacs.length){
        apClause = `"apMac" in (${apMacs.join(', ')})`
      }
    }
    if(isSwitchReport){
      if(switchGroupIds.length && isSwitchReport){
        switchGroupClause = `"switchGroupLevelOneName" in (${switchGroupIds.join(', ')})`
      }

      if(switchMacs.length && isSwitchReport){
        switchClause = `"switchId" in (${switchMacs.join(', ')})`
      }
    }

    if(zoneClause || apClause || switchGroupClause || switchClause){
      networkClause = ` (${[zoneClause,apClause,switchGroupClause,switchClause]
        .filter(item=>item!=='').join(' OR ')})`
    }
  }

  return {
    radioBandClause,
    networkClause
  }
}


export function EmbeddedReport (props: ReportProps) {
  const { reportName, rlsClause, hideHeader } = props
  const embedDashboardName = reportTypeDataStudioMapping[reportName]
  const params = useParams()
  const [ guestToken ] = useGuestTokenMutation()
  const [ embeddedId ] = useEmbeddedIdMutation()
  const { startDate, endDate } = useDateFilter()
  const [dashboardEmbeddedId, setDashboardEmbeddedId] = useState<string | null>(null)
  const { filters: { paths, bands } } = useReportsFilter()
  const { networkClause, radioBandClause } = getSupersetRlsClause(reportName,
    paths,bands as RadioBand[])
  const { firstName, lastName, email } = get('IS_MLISA_SA')
    ? getUserProfileRA()
    : getUserProfileR1().profile

  /**
  * Hostname - Backend service where superset is running.
  * For developement,
  * Use https://dev.ruckus.cloud, for dev ruckus cloud.
  * Use https://alto.local.mlisa.io, for minikube.
  **/
  const HOST_NAME = process.env['NODE_ENV'] === 'development'
    ? get('IS_MLISA_SA') ?
      'https://staging.mlisa.io'
      :
      'https://dev.ruckus.cloud'
    : window.location.origin // Production

  useEffect(() => {
    const embeddedData = {
      allowed_domains: [],
      dashboard_title: embedDashboardName
    }
    embeddedId({ payload: embeddedData }).unwrap().then(uuid => setDashboardEmbeddedId(uuid))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedDashboardName])

  const guestTokenPayload = {
    user: {
      firstName,
      lastName,
      email
    },
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
        supersetDomain: `${HOST_NAME}${REPORT_BASE_RELATIVE_URL}`,
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
