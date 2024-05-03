import { useEffect, useState } from 'react'

import { embedDashboard, EmbeddedDashboard } from '@superset-ui/embedded-sdk'
import moment                                from 'moment'

import { showExpiredSessionModal } from '@acx-ui/analytics/components'
import { SystemMap, useSystems }   from '@acx-ui/analytics/services'
import {
  getUserProfile as getUserProfileRA,
  useAnalyticsFilter,
  RolesEnum as RolesEnumRA
} from '@acx-ui/analytics/utils'
import type { UserProfile as UserProfileRA } from '@acx-ui/analytics/utils'
import { RadioBand, Loader }                 from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { useIsSplitOn, Features }            from '@acx-ui/feature-toggle'
import {
  useGuestTokenMutation,
  useEmbeddedIdMutation,
  EmbeddedResponse
} from '@acx-ui/reports/services'
import { useReportsFilter }                                                 from '@acx-ui/reports/utils'
import { REPORT_BASE_RELATIVE_URL }                                         from '@acx-ui/store'
import { RolesEnum as RolesEnumR1 }                                         from '@acx-ui/types'
import { getUserProfile as getUserProfileR1, UserProfile as UserProfileR1 } from '@acx-ui/user'
import { useDateFilter, getJwtToken, NetworkPath, useLocaleContext }        from '@acx-ui/utils'

import {
  bandDisabledReports,
  ReportType,
  reportTypeDataStudioMapping,
  reportTypeMapping,
  networkFilterDisabledReports
} from '../mapping/reportsMapping'

interface ReportProps {
  reportName: ReportType;
  rlsClause?: string;
  hideHeader?: boolean;
}

type CommonUserProfile = Pick<UserProfileRA,
  'firstName' | 'lastName' | 'email' | 'userId' | 'selectedTenant'>
  & Pick<UserProfileR1, 'externalId' | 'tenantId' | 'swuId' | 'roles'>

export function convertDateTimeToSqlFormat (dateTime: string): string {
  return moment.utc(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

const getReportType = (reportName: ReportType) => {
  const mode = reportTypeMapping[reportName]
  const isApReport = ['ap', 'both'].includes(mode)
  const isSwitchReport = ['switch', 'both'].includes(mode)
  const isRadioBandDisabled = bandDisabledReports.includes(reportName)
  const isNetworkFilterDisabled = networkFilterDisabledReports.includes(reportName)

  return {
    isApReport,
    isSwitchReport,
    isRadioBandDisabled,
    isNetworkFilterDisabled
  }
}

export const getSupersetRlsClause = (
  reportName: ReportType,
  paths?: NetworkPath[],
  radioBands?: RadioBand[]
) => {
  const { isApReport,
    isSwitchReport,
    isRadioBandDisabled,
    isNetworkFilterDisabled } = getReportType(reportName)
  const clause = {
    radioBandClause: '',
    networkClause: ''
  }

  // If networkFilter is not shown, do not read it from URL
  // Reports like Overview and WLAN does not support network filter
  if (isNetworkFilterDisabled) return clause

  if (radioBands?.length && isApReport && !isRadioBandDisabled) {
    const radioBandClause = ` "band" in (${radioBands
      .map((radioBand) => `'${radioBand}'`)
      .join(', ')})`
    clause.radioBandClause = radioBandClause
  }

  /* istanbul ignore else */
  if (paths?.length) {
    let zoneClause = ''
    let apClause = ''
    let switchGroupClause = ''
    let switchClause = ''

    const zoneIds: string[] = []
    const switchGroupIds: string[] = []
    const apMacs: string[] = []
    const switchMacs: string[] = []

    paths.forEach((path) => {
      switch (path.length) {
        case 2:
          if (path[1].type === 'zone') {
            zoneIds.push(`'${path[1].name}'`)
          } else if (path[1].type === 'switchGroup') {
            switchGroupIds.push(`'${path[1].name}'`)
          }
          break
        case 3:
          if (path[2].type === 'AP') {
            apMacs.push(`'${path[2].name}'`)
          } else if (path[2].type === 'switch') {
            switchMacs.push(`'${path[2].name}'`)
          }
          break
      }
    })

    if (isApReport) {
      if (zoneIds.length) {
        zoneClause = `"zoneName" in (${zoneIds.join(', ')})`
      }
      if (apMacs.length) {
        apClause = `"apMac" in (${apMacs.join(', ')})`
      }
    }

    if (isSwitchReport) {
      if (switchGroupIds.length) {
        switchGroupClause = `"switchGroupLevelOneName" in (${switchGroupIds.join(', ')})`
      }
      if (switchMacs.length) {
        switchClause = `"switchId" in (${switchMacs.join(', ')})`
      }
    }

    if(zoneClause || apClause || switchGroupClause || switchClause)
      clause.networkClause = ` (${[
        zoneClause,
        apClause,
        switchGroupClause,
        switchClause
      ].filter(Boolean)
        .join(' OR ')})`
  }

  return clause
}

export const getRLSClauseForSA = (
  paths: NetworkPath,
  systemMap: SystemMap | undefined,
  reportName: ReportType
) => {

  const { isNetworkFilterDisabled } = getReportType(reportName)

  // If networkFilter is not shown, do not read it from URL
  // Reports like Overview and WLAN does not support network filter
  if (isNetworkFilterDisabled) return {
    radioBandClause: '',
    networkClause: ''
  }

  // Initialize an empty object to group conditions by type
  const sqlConditionsByType: Record<string, string[]> = {}

  // Iterate through the data and group SQL conditions by type
  paths.forEach(item => {
    const { name, type } = item

    if(type === 'network') // Skip network, as its not understood by druid
      return

    if (!sqlConditionsByType[type]) {
      sqlConditionsByType[type] = []
    }

    switch (type) {
      case 'system':
        const systems = systemMap?.[name]
        if (systems) {
          systems.forEach(({ deviceId }) => {
            sqlConditionsByType[type].push(`"${type}" = '${deviceId}'`)
          })
        }
        break
      case 'domain':
        sqlConditionsByType[type].push(`"domains" like '%${name}%'`)
        break
      case 'AP':
        sqlConditionsByType[type].push(`"apMac" = '${name}'`)
        break
      case 'switch':
        sqlConditionsByType[type].push(`"switchId" = '${name}'`)
        break
      default:
        sqlConditionsByType[type].push(`"${type}" = '${name}'`)
        break
    }
  })

  // Initialize an empty array to store SQL conditions
  const sqlConditions: string[] = []

  // Convert grouped conditions to SQL format
  for (const type in sqlConditionsByType) {
    if (sqlConditionsByType.hasOwnProperty(type)) {
      const conditions = sqlConditionsByType[type]
      let joinedConditions = conditions.join(' OR ')
      if (conditions.length > 1) joinedConditions = `(${joinedConditions})`
      sqlConditions.push(joinedConditions)
    }
  }

  // Combine SQL conditions using 'AND' or 'OR' as needed
  return {
    networkClause: sqlConditions.filter(Boolean)
      .join(' AND ')
      .replace(/\bzone\b/g, 'zoneName')
      .replace(/\bapGroup\b/g, 'apGroupName')
      .replace(/\bswitchGroup\b/g, 'switchGroupLevelOneName')
      .replace(/\bswitchSubGroup\b/g, 'switchGroupLevelTwoName'),
    radioBandClause: null
  }
}

export function EmbeddedReport (props: ReportProps) {
  const { reportName, rlsClause, hideHeader } = props

  const isRA = get('IS_MLISA_SA')
  const embedDashboardName = reportTypeDataStudioMapping[reportName]
  const systems = useSystems()

  const [ guestToken ] = useGuestTokenMutation()
  const [ embeddedId ] = useEmbeddedIdMutation()
  const { startDate, endDate } = useDateFilter()
  const { pathFilters: { path } } = useAnalyticsFilter()
  const { filters: { paths, bands } } = useReportsFilter()

  const [dashboardEmbeddedId, setDashboardEmbeddedId] = useState<string|null>(null)

  const { firstName, lastName, email, externalId,
    tenantId, userId, selectedTenant, swuId, roles } = isRA
    ? getUserProfileRA() as unknown as CommonUserProfile
    : getUserProfileR1().profile as unknown as CommonUserProfile

  const defaultLocale = 'en'
  const localeContext = useLocaleContext()

  const locale = useIsSplitOn(Features.I18N_DATA_STUDIO_TOGGLE)
    ? localeContext.messages?.locale ?? defaultLocale
    : defaultLocale

  /**
   * Hostname - Backend service where superset is running.
   * For developement,
   * Use https://dev.ruckus.cloud, for dev ruckus cloud.
   * Use https://alto.local.mlisa.io, for minikube.
   **/
  const HOST_NAME =
    process.env['NODE_ENV'] === 'development'
      ? get('IS_MLISA_SA')
        ? 'https://staging.mlisa.io'
        // ? 'https://local.mlisa.io'
        : 'https://dev.ruckus.cloud'
        // : 'https://alto.local.mlisa.io'
      : window.location.origin // Production

  /**
   * Show expired session modal if session is expired, triggered from sueprset
   */
  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'unauthorized') {
        showExpiredSessionModal()
      }
    }
    window.addEventListener('message', eventHandler)
    return () => window.removeEventListener('message', eventHandler)
  }, [])

  useEffect(() => {
    const embeddedData = {
      allowed_domains: [],
      dashboard_title: embedDashboardName
    }
    embeddedId({ payload: embeddedData })
      .unwrap()
      .then((resp: EmbeddedResponse) => {
        const { result, user_info } = resp
        if (user_info) {
          sessionStorage.setItem('user_info', JSON.stringify(user_info))
        }
        setDashboardEmbeddedId(result.uuid)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedDashboardName])

  const fetchGuestTokenFromBackend = async () => {

    const { networkClause, radioBandClause } = isRA
      ? getRLSClauseForSA(
        path,
        systems.data,
        reportName
      )
      : getSupersetRlsClause(
        reportName,
        paths,
        bands as RadioBand[]
      )

    const guestTokenPayload = {
      user: {
        firstName,
        lastName,
        email
      },
      resources: [
        {
          type: 'dashboard',
          id: dashboardEmbeddedId
        }
      ],
      rls: [
        {
          clause: [
            '"__time"',
            '>=',
            `'${convertDateTimeToSqlFormat(startDate)}'`,
            'AND',
            '"__time"',
            '<',
            `'${convertDateTimeToSqlFormat(endDate)}'`,
            ...(
              isRA
                ? ['AND', `'${userId}' = '${userId}'`, 'AND',
                  `'${selectedTenant.id}' = '${selectedTenant.id}'`] // For RAI, selectedTenant id to cover supertenant use case
                : ['AND', `'${tenantId}' = '${tenantId}'`,
                  'AND', `'${externalId}' = '${externalId}'` ] // For R1, externalId is userId
            )
          ].join(' ')
        },
        ...(rlsClause || networkClause || radioBandClause
          ? [{
            clause: rlsClause
              ? rlsClause
              : [
                networkClause.trim(),
                networkClause && radioBandClause
                  ? ' AND ' + radioBandClause.trim()
                  : radioBandClause
              ].join('')
          }]
          : [])
      ]
    }
    // eslint-disable-next-line no-console
    console.log(
      '%c[%s][EmbeddedReport] -> Refreshing guest token for [%s]',
      'color: green',
      new Date().toLocaleString(),
      embedDashboardName
    )
    return await guestToken({ payload: guestTokenPayload }).unwrap()
  }

  useEffect(() => {
    if (!dashboardEmbeddedId || (isRA && systems.status === 'pending')) return

    let timer: ReturnType<typeof setInterval>
    let embeddedObj: Promise<EmbeddedDashboard>
    const jwtToken = getJwtToken()

    embeddedObj = embedDashboard({
      id: dashboardEmbeddedId,
      supersetDomain: `${HOST_NAME}${REPORT_BASE_RELATIVE_URL}`,
      mountPoint: document.getElementById(
        `acx-report-${dashboardEmbeddedId}`
      )!,
      fetchGuestToken: () => fetchGuestTokenFromBackend(),
      dashboardUiConfig: {
        hideChartControls: true,
        hideTitle: hideHeader ?? true
      },
      // debug: true, // Enable this for debugging
      authToken: jwtToken ? `Bearer ${jwtToken}` : undefined,
      username: isRA ? userId : swuId,
      isReadOnly: isRA
        ? selectedTenant.role === RolesEnumRA.BUSINESS_INSIGHTS_USER
        : !(roles.includes(RolesEnumR1.PRIME_ADMIN) || roles.includes(RolesEnumR1.ADMINISTRATOR)),
      locale // i18n locale from R1
    })
    embeddedObj.then(async (embObj) => {
      timer = setInterval(async () => {
        const { height } = await embObj.getScrollSize()
        if (height > 0) {
          const iframeElement = document.querySelector(
            `div[id="acx-report-${dashboardEmbeddedId}"] > iframe`
          )
          if (iframeElement) {
            iframeElement.setAttribute(
              'style',
              `height: ${height}px !important`
            )
          }
        }
      }, 1000)
    })
    return () => {
      if (timer) clearTimeout(timer)
      if (embeddedObj) embeddedObj.then((embObj) => {
        // eslint-disable-next-line no-console
        console.log(
          '%c[%s][EmbeddedReport] -> Unmounting dashboard [%s]',
          'color: yellow',
          new Date().toLocaleString(),
          embedDashboardName
        )
        embObj.unmount()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, paths, bands, path, dashboardEmbeddedId, systems.status, locale])

  return (
    <Loader>
      <div id={`acx-report-${dashboardEmbeddedId}`} className='acx-report' />
    </Loader>
  )
}
