import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker } from '@acx-ui/components'
import { useVenueDetailsHeaderQuery }      from '@acx-ui/rc/services'
import {
  useConfigTemplateBreadcrumb,
  useConfigTemplate,
  VenueDetailHeader,
  useConfigTemplateTenantLink
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess, getShowWithoutRbacCheckKey } from '@acx-ui/user'
import { useDateFilter }                              from '@acx-ui/utils'

import VenueTabs from './VenueTabs'


function DatePicker () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
  />
}


function VenuePageHeader () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { tenantId, venueId, activeTab } = useParams()
  const enableTimeFilter = () => !['networks', 'services', 'units'].includes(activeTab as string)

  const { data } = useVenueDetailsHeaderQuery({ params: { tenantId, venueId } })

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/venues/${venueId}`)
  const templateBasePath = useConfigTemplateTenantLink(`venues/${venueId}`)

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Venues' }), link: '/venues' }
  ])

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        enableTimeFilter() ? <DatePicker key={getShowWithoutRbacCheckKey('date-filter')} /> : <></>,
        ...filterByAccess([<Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${isTemplate ? templateBasePath.pathname : basePath.pathname}/edit/details`
            }, {
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
