import moment      from 'moment'
import { useIntl } from 'react-intl'


import { Button, DisabledButton, PageHeader, RangePicker }    from '@acx-ui/components'
import { ArrowExpand }                                        from '@acx-ui/icons'
import { useLocation, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                     from '@acx-ui/user'
import { useDateFilter }                                      from '@acx-ui/utils'

import NetworkTabs       from './NetworkTabs'
import { useGetNetwork } from './services'

function NetworkPageHeader () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const network = useGetNetwork()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/networks/wireless')
  const { networkId } = useParams()
  const { $t } = useIntl()
  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
      ]}
      extra={filterByAccess([
        <DisabledButton key='hierarchy-filter'>
          {$t({ defaultMessage: 'All Active Venues' })}<ArrowExpand /></DisabledButton>,
        <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/${networkId}/edit`
            }, {
              state: {
                from: location
              }
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ])}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
