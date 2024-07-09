import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  ContentSwitcherProps,
  ContentSwitcher
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useVenuesLeasesListQuery,
  useGetDHCPProfileQuery,
  useVenueDHCPProfileQuery,
  useGetVenueTemplateDhcpProfileQuery,
  useGetDhcpTemplateQuery
} from '@acx-ui/rc/services'
import {
  DHCPLeasesStatusEnum,
  DHCPConfigTypeEnum,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  VenueDHCPProfile,
  DHCPSaveData
} from '@acx-ui/rc/utils'

import BasicInfo         from './BasicInfo'
import LeaseTable        from './LeaseTable'
import PoolTable         from './PoolTable'
import { DisabledLabel } from './styledComponents'

const DHCPInstance = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { data: leasesList } = useVenuesLeasesListQuery(
    { params, enableRbac }, { skip: isTemplate })

  const onlineList = _.filter(leasesList, (item)=>{
    return item.status === DHCPLeasesStatusEnum.ONLINE
  })

  // eslint-disable-next-line max-len
  const { data: venueDHCPProfile, isFetching: isVenueDhcpFetching } = useConfigTemplateQueryFnSwitcher<VenueDHCPProfile>({
    useQueryFn: useVenueDHCPProfileQuery,
    useTemplateQueryFn: useGetVenueTemplateDhcpProfileQuery,
    extraParams: params,
    enableRbac
  })

  // eslint-disable-next-line max-len
  const { data: dhcpProfile, isFetching: isProfileFetching } = useConfigTemplateQueryFnSwitcher<DHCPSaveData | null>({
    useQueryFn: useGetDHCPProfileQuery,
    useTemplateQueryFn: useGetDhcpTemplateQuery,
    skip: !venueDHCPProfile?.serviceProfileId,
    extraParams: { serviceId: venueDHCPProfile?.serviceProfileId },
    enableRbac
  })

  const leaseContent = $t({ defaultMessage: 'Lease Table ({count} Online)' },
    { count: onlineList.length || 0 })
  const leaseDisable = dhcpProfile?.dhcpMode === DHCPConfigTypeEnum.SIMPLE
  const leaseLabel = leaseDisable ?
    <DisabledLabel children={leaseContent}/>
    :
    leaseContent

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Pools ({count})' },
        { count: dhcpProfile?.dhcpPools.length || 0 }),
      value: 'pools',
      children: <GridCol col={{ span: 24 }}>
        {venueDHCPProfile && dhcpProfile &&
          <PoolTable
            venueDHCPProfile={venueDHCPProfile}
            dhcpProfile={dhcpProfile}
            isFetching={isVenueDhcpFetching || isProfileFetching}
          />}</GridCol>
    },
    {
      label: leaseLabel,
      disabled: leaseDisable,
      value: 'lease',
      children: <GridCol col={{ span: 24 }}><LeaseTable /></GridCol>
    }
  ]

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <BasicInfo/>
      </GridCol>
      {
        venueDHCPProfile?.enabled && (
          isTemplate ?
            venueDHCPProfile && dhcpProfile && <PoolTable venueDHCPProfile={venueDHCPProfile}
              dhcpProfile={dhcpProfile}
              isFetching={isVenueDhcpFetching || isProfileFetching} />
            : <ContentSwitcher tabDetails={tabDetails} size='large' />
        )
      }
    </GridRow>
  )
}

export default DHCPInstance
