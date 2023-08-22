import { useEffect, useState } from 'react'

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
  const { data: networkData, isLoading } = useGetNetwork()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/networks/wireless')
  const { networkId, activeTab } = useParams()
  const { $t } = useIntl()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const supportOweTransition = useIsSplitOn(Features.WIFI_EDA_OWE_TRANSITION_TOGGLE)
  const enableTimeFilter = () => !['aps', 'venues'].includes(activeTab as string)
  const [ disableConfigure, setDisableConfigure ] = useState(false)

  useEffect(() => {
    if ((supportOweTransition && !isLoading)) {
      setDisableConfigure(networkData?.isOweMaster === false && 'owePairNetworkId' in networkData)
    }
  }, [networkData, isLoading, supportOweTransition])

  return (
    <PageHeader
      title={networkData?.name || ''}
      breadcrumb={isNavbarEnhanced ? [
        { text: $t({ defaultMessage: 'Wi-Fi' }), link: '' },
        { text: $t({ defaultMessage: 'Wi-Fi Networks' }), link: '' },
        { text: $t({ defaultMessage: 'Network List' }), link: '/networks' }
      ] : [{ text: $t({ defaultMessage: 'Networks' }), link: '/networks' }]}
      extra={[
        ...(setSelectedVenues && selectedVenues)
          ? [
            <ActiveVenueFilter
              selectedVenues={selectedVenues}
              setSelectedVenues={setSelectedVenues}
            />
          ]
          : [],
        enableTimeFilter()
          ? <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />
          : <></>,
        ...filterByAccess([
          <Button
            type='primary'
            hidden={disableConfigure}
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
        ])
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
