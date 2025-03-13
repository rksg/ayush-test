import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { usePathBasedOnConfigTemplate }                             from '@acx-ui/rc/components'
import { useVenueDetailsHeaderQuery }                               from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  useConfigTemplate,
  useConfigTemplateBreadcrumb,
  VenueDetailHeader,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'
import { WifiScopes, EdgeScopes, SwitchScopes }       from '@acx-ui/types'
import { filterByAccess, getShowWithoutRbacCheckKey } from '@acx-ui/user'
import { getOpsApi, useDateFilter }                   from '@acx-ui/utils'

import VenueTabs from './VenueTabs'


function DatePicker () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate, setDateFilter, range } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
    maxMonthRange={isDateRangeLimit ? 1 : 3}
  />
}


function VenuePageHeader () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { tenantId, venueId, activeTab, activeSubTab, categoryTab } = useParams()
  const isWifiReportView = (activeSubTab === 'wifi' && categoryTab === 'overview')
  // eslint-disable-next-line max-len
  const enableTimeFilter = () => !['clients', 'networks', 'services', 'units'].includes(activeTab as string)

  const { data } = useVenueDetailsHeaderQuery({
    params: { tenantId, venueId },
    payload: { isTemplate }
  })

  const navigate = useNavigate()
  const location = useLocation()
  const detailsPath = usePathBasedOnConfigTemplate(
    `/venues/${venueId}/edit/`,
    `/venues/${venueId}/edit/details`
  )

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }), link: '/venues' }
  ])

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        // eslint-disable-next-line max-len
        enableTimeFilter() || isWifiReportView ? <DatePicker key={getShowWithoutRbacCheckKey('date-filter')} /> : <></>,
        ...filterByAccess([<Button
          type='primary'
          rbacOpsIds={[
            getOpsApi(CommonUrlsInfo.updateVenue),
            getOpsApi(WifiRbacUrlsInfo.updateVenueRadioCustomization),
            getOpsApi(CommonUrlsInfo.updateVenueSwitchSetting)
          ]}
          scopeKey={[WifiScopes.UPDATE, EdgeScopes.UPDATE, SwitchScopes.UPDATE]}
          onClick={() =>
            navigate(detailsPath, {
              state: {
                from: location
              }
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>])
      ]}
      footer={<VenueTabs venueDetail={data as VenueDetailHeader} />}
    />
  )
}

export default VenuePageHeader
