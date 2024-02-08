import { useEffect, useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker }                                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { generateConfigTemplateBreadcrumb, getConfigTemplatePath, useConfigTemplate } from '@acx-ui/rc/utils'
import { TenantType }                                                                 from '@acx-ui/react-router-dom'
import { useLocation, useNavigate, useTenantLink, useParams }                         from '@acx-ui/react-router-dom'
import { filterByAccess }                                                             from '@acx-ui/user'
import { useDateFilter }                                                              from '@acx-ui/utils'

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
  const { isTemplate } = useConfigTemplate()
  const basePath = useTenantLink('/networks/wireless')
  const templateBasePath = useTenantLink(getConfigTemplatePath('networks/wireless'), 'v')
  const { networkId, activeTab } = useParams()
  const { $t } = useIntl()
  const supportOweTransition = useIsSplitOn(Features.WIFI_EDA_OWE_TRANSITION_TOGGLE)
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
    if ((supportOweTransition && !isLoading)) {
      setDisableConfigure(
        networkData?.isOweMaster === false &&
        networkData?.owePairNetworkId !== undefined)
    }
  }, [networkData, isLoading, supportOweTransition])

  return (
    <PageHeader
      title={networkData?.name || ''}
      breadcrumb={breadcrumb}
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
                // eslint-disable-next-line max-len
                pathname: `${isTemplate ? templateBasePath.pathname : basePath.pathname}/${networkId}/edit`
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
