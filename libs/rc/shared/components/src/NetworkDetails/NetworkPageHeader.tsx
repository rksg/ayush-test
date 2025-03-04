import { useEffect, useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import {
  ConfigTemplateType,
  ConfigTemplateUrlsInfo,
  generateConfigTemplateBreadcrumb,
  useConfigTemplate,
  useConfigTemplateTenantLink,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantType }                                         from '@acx-ui/react-router-dom'
import { useLocation, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { WifiScopes }                                         from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import { getOpsApi, useDateFilter } from '@acx-ui/utils'

import { EnforcedButton } from '../configTemplates/EnforcedButton'

import { ActiveVenueFilter } from './ActiveVenueFilter'
import NetworkTabs           from './NetworkTabs'
import { useGetNetwork }     from './services'

function NetworkPageHeader ({
  setSelectedVenues,
  selectedVenues
}: {
  setSelectedVenues?: CallableFunction,
  selectedVenues?: string[]
}) {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate, setDateFilter, range } = useDateFilter({
    showResetMsg, earliestStart: getDefaultEarliestStart() })
  const { data: networkData, isLoading } = useGetNetwork()
  const navigate = useNavigate()
  const location = useLocation()
  const { isTemplate } = useConfigTemplate()
  const { rbacOpsApiEnabled } = getUserProfile()
  const basePath = useTenantLink('/networks/wireless')
  const templateBasePath = useConfigTemplateTenantLink('networks/wireless')
  const { networkId, activeTab } = useParams()
  const { $t } = useIntl()
  const enableTimeFilter = () => !['aps', 'venues'].includes(activeTab as string)
  const [ disableConfigure, setDisableConfigure ] = useState(false)

  const GenBreadcrumb = () => {
    const { isTemplate } = useConfigTemplate()
    if (isTemplate) {
      return generateConfigTemplateBreadcrumb()
    }

    return [
      { text: $t({ defaultMessage: 'Wi-Fi' }), link: '' },
      { text: $t({ defaultMessage: 'Wi-Fi Networks' }), link: '' },
      { text: $t({ defaultMessage: 'Network List' }), link: '/networks' }
    ] as { text: string, link?: string, tenantType?: TenantType }[]
  }
  const breadcrumb = GenBreadcrumb()

  useEffect(() => {
    if (!isLoading) {
      setDisableConfigure(
        networkData?.isOweMaster === false &&
        networkData?.owePairNetworkId !== undefined)
    }
  }, [networkData, isLoading])

  const updateNetworkOpsApi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.updateNetworkTemplateRbac
    : WifiRbacUrlsInfo.updateNetworkDeep)

  const hasUpdateNetworkPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([ updateNetworkOpsApi ])
    : (hasCrossVenuesPermission()
    && hasPermission({ scopes: [WifiScopes.UPDATE] }) )

  return (
    <PageHeader
      title={networkData?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        ...((setSelectedVenues && selectedVenues) ? [
          <ActiveVenueFilter
            selectedVenues={selectedVenues}
            setSelectedVenues={setSelectedVenues}
          />
        ] : []),
        ...(enableTimeFilter() ? [
          <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
            maxMonthRange={isDateRangeLimit ? 1 : 3}
          />
        ]: []),
        ...(hasUpdateNetworkPermission ? [
          <EnforcedButton
            configTemplateType={ConfigTemplateType.NETWORK}
            instanceId={networkId}
            scopeKey={[WifiScopes.UPDATE]}
            type='primary'
            hidden={disableConfigure}
            onClick={() =>
              navigate({
                ...basePath,
                // eslint-disable-next-line max-len
                pathname: `${isTemplate ? templateBasePath.pathname : basePath.pathname}/${networkId}/edit`
              }, {
                state: {
                  from: location
                }
              })
            }
          >{$t({ defaultMessage: 'Configure' })}</EnforcedButton>
        ] : [])
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
