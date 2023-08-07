import { useEffect, useState } from 'react'

import { truncate } from 'fs/promises'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { useLocation, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                     from '@acx-ui/user'
import { useDateFilter }                                      from '@acx-ui/utils'

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
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const network = useGetNetwork()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/networks/wireless')
  const { networkId, activeTab } = useParams()
  const { $t } = useIntl()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const enableTimeFilter = () => !['aps', 'venues'].includes(activeTab as string)
  const [ disableConfigure, setDisableConfigure ] = useState(false)

  useEffect(() => {
    if (network.isSuccess && network.data) {
      setDisableConfigure('isOweMaster' in network.data ? !(network.data?.isOweMaster) : false)
    }
  }, [network.data])

  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={isNavbarEnhanced ? [
        { text: $t({ defaultMessage: 'Wi-Fi' }), link: '' },
        { text: $t({ defaultMessage: 'Wi-Fi Networks' }), link: '' },
        { text: $t({ defaultMessage: 'Network List' }), link: '/networks' }
      ] : [{ text: $t({ defaultMessage: 'Networks' }), link: '/networks' }]}
      extra={filterByAccess([
        ...(setSelectedVenues && selectedVenues)
          ? [
            <ActiveVenueFilter
              selectedVenues={selectedVenues}
              setSelectedVenues={setSelectedVenues}
              key='hierarchy-filter'
            />
          ]
          : [],
        enableTimeFilter()
          ? <RangePicker
            key='date-filter'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />
          : <></>,
        <Button
          type='primary'
          disabled={disableConfigure}
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
