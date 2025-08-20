import { useContext } from 'react'

import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, cssStr, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
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
  const { serialNumber } = useParams()
  const { apData, venueData, apGroupData } = useContext(ApDataContext)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)

  const titleWithVenueApGroup = isApGroupMoreParameterPhase1Enabled ?
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div>{apData?.name || ''}</div>
      <Space direction='horizontal' size={0} style={{ height: '15px' }}>
        <div style={{ fontSize: '13px', color: cssStr('--acx-neutrals-60') }}>
          {$t({ defaultMessage: '<VenueSingular></VenueSingular> :' })}{' '}
          <TenantLink
            to={`venues/${venueData?.id}/venue-details/overview`}>{venueData?.name}
          </TenantLink>
        </div>
        <Divider type='vertical'/>
        {/* eslint-disable-next-line max-len */}
        <div style={{ fontSize: '13px', color: cssStr('--acx-neutrals-60') }}>
          {$t({ defaultMessage: 'Ap Group :' })}{' '}
          {(apData?.apGroupId && apGroupData?.name)
            ? <TenantLink
              to={`/devices/apgroups/${apData?.apGroupId}/details/members`}>{apGroupData?.name}
            </TenantLink>
            : $t({ defaultMessage: 'None' }) }
        </div>
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
