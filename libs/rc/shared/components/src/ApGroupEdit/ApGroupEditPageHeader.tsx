import { useContext, useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { cssStr, PageHeader }                                                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { useGetVenuesTemplateListQuery, useVenuesListQuery }                                 from '@acx-ui/rc/services'
import { TableResult, useConfigTemplateBreadcrumb, useConfigTemplateQueryFnSwitcher, Venue } from '@acx-ui/rc/utils'
import { TenantLink }                                                                        from '@acx-ui/react-router-dom'

import { ApGroupEditTabs }    from './ApGroupEditTabs'
import { ApGroupEditContext } from './context'

const defaultVenuePayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function ApGroupEditPageHeader () {
  const { $t } = useIntl()
  const { isEditMode, isApGroupTableFlag, isRbacEnabled, venueId } = useContext(ApGroupEditContext)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)
  const [venueName, setVenueName] = useState<string>('')

  const venuesList = useConfigTemplateQueryFnSwitcher<TableResult<Venue>>({
    useQueryFn: useVenuesListQuery,
    useTemplateQueryFn: useGetVenuesTemplateListQuery,
    skip: !isApGroupMoreParameterPhase1Enabled,
    payload: defaultVenuePayload,
    enableRbac: isRbacEnabled
  })

  useEffect(() => {
    if (venuesList?.data && venueId) {
      setVenueName(venuesList?.data.data.filter((venue) => venue.id === venueId)[0].name)
    }
  }, [venuesList, venueId])

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Wi-Fi' }) },
    { text: $t({ defaultMessage: 'Access Points' }) },
    { text: $t({ defaultMessage: 'AP Group List' }), link: '/devices/wifi/apgroups' }
  ])

  const titleWithVenue = isApGroupMoreParameterPhase1Enabled
    ? <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div>{$t({ defaultMessage: 'Edit AP Group' })}</div>
      <Space direction='horizontal' size={0} style={{ height: '15px' }}>
        <div style={{ fontSize: '13px', color: cssStr('--acx-neutrals-60') }}>Venue: <TenantLink
          to={`venues/${venueId}/venue-details/overview`}>{venueName}
        </TenantLink></div>
      </Space>
    </div>
    : $t({ defaultMessage: 'Edit AP Group' })

  return (
    <PageHeader
      title={!isEditMode
        ? $t({ defaultMessage: 'Add AP Group' })
        : titleWithVenue
      }
      breadcrumb={breadcrumb}
      footer={(isEditMode && isApGroupTableFlag) ? <ApGroupEditTabs/> : null}
    />
  )
}
