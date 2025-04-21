import { useContext, useEffect, useState } from 'react'

import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, cssStr, PageHeader }                                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                                                          from '@acx-ui/feature-toggle'
import { useApGroupsListQuery, useGetApGroupsTemplateListQuery, useGetApOperationalQuery } from '@acx-ui/rc/services'
import { ApGroupViewModel, TableResult, useConfigTemplateQueryFnSwitcher }                 from '@acx-ui/rc/utils'
import {
  TenantLink,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import ApEditTabs from './ApEditTabs'

import { ApDataContext } from '.'

function ApEditPageHeader () {
  const { $t } = useIntl()
  const { serialNumber, tenantId } = useParams()
  const { apData, venueData } = useContext(ApDataContext)
  const [apGroup, setApGroup] = useState('')
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)

  const { data: apGroupInfo } = useConfigTemplateQueryFnSwitcher<TableResult<ApGroupViewModel>>({
    useQueryFn: useApGroupsListQuery,
    useTemplateQueryFn: useGetApGroupsTemplateListQuery,
    payload: {
      searchString: '',
      fields: [ 'id', 'venueId', 'name'],
      filters: { venueId: [venueData?.id] },
      pageSize: 10000
    },
    skip: !venueData?.id && !isApGroupMoreParameterPhase1Enabled
  })

  const {
    data: apDetails
  } = useGetApOperationalQuery({
    params: {
      tenantId,
      serialNumber: serialNumber ? serialNumber : '',
      venueId: venueData ? venueData.id : ''
    },
    skip: !isApGroupMoreParameterPhase1Enabled
  })

  useEffect(() => {
    if (apGroupInfo?.data && apDetails) {
      setApGroup(apGroupInfo.data.filter((group) => group.id === apDetails.apGroupId)[0].name)
    }
  }, [apGroupInfo, apDetails])

  // eslint-disable-next-line max-len
  const titleWithVenueApGroup = isApGroupMoreParameterPhase1Enabled ?
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div>{apData?.name || ''}</div>
      <Space direction='horizontal' size={0} style={{ height: '15px' }}>
        <div style={{ fontSize: '13px', color: cssStr('--acx-neutrals-60') }}>Venue: <TenantLink
          to={`venues/${venueData?.id}/venue-details/overview`}>{venueData?.name}
        </TenantLink></div>
        <Divider type='vertical'/>
        {/* eslint-disable-next-line max-len */}
        <div style={{ fontSize: '13px', color: cssStr('--acx-neutrals-60') }}>Ap Group: {apGroup ? <TenantLink
          to={`/devices/apgroups/${apDetails?.apGroupId}/details/members`}>{apGroup}
        </TenantLink> : 'None'}</div>
      </Space>
    </div>
    : apData?.name || ''


  return (
    <PageHeader
      title={titleWithVenueApGroup}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ]}
      extra={filterByAccess([
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/details/overview`
            })
          }>{ $t({ defaultMessage: 'Back to device details' }) }</Button>
      ])}
      footer={<ApEditTabs />}
    />
  )
}

export default ApEditPageHeader
