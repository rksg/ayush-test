import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Button }                                                  from '@acx-ui/components'
import { Features }                                                from '@acx-ui/feature-toggle'
import { EdgesTable, EdgesTableQueryProps, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  useGetVenueEdgeCompatibilitiesQuery,
  useGetVenueEdgeCompatibilitiesV1_1Query
} from '@acx-ui/rc/services'
import {
  EdgeUrlsInfo, retrievedEdgeCompatibilitiesOptions,
  VenueEdgeCompatibilitiesResponse, VenueEdgeCompatibilitiesResponseV1_1
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { EdgeScopes }            from '@acx-ui/types'
import { hasPermission }         from '@acx-ui/user'
import { getOpsApi }             from '@acx-ui/utils'

import { CompatibilityCheck } from './CompatibilityCheck'

const SpaceWrapper = styled(Space)`
  width: 100%;
  margin: 12px 0px;
  justify-content: flex-end;
`

export const VenueEdge = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const settingsId = 'venue-edges-table'
  const baseFields = ['name', 'deviceStatus', 'type', 'model',
    'serialNumber', 'ip', 'ports', 'tags', 'firmwareVersion', 'venueId']
  const finalFields = isEdgeCompatibilityEnhancementEnabled
    ? [...baseFields, 'incompatibleV1_1'] : [...baseFields, 'incompatible']
  const tableQuery: EdgesTableQueryProps = {
    defaultPayload: {
      fields: finalFields,
      filters: { venueId: [params.venueId] }
    },
    pagination: { settingsId }
  }

  const edgeCompatibilities = useGetVenueEdgeCompatibilities(params.venueId)

  const featureIncompatible = retrievedEdgeCompatibilitiesOptions(edgeCompatibilities)
  const hasCreateEdgePermission = hasPermission({
    scopes: [EdgeScopes.CREATE],
    rbacOpsIds: [
      [
        getOpsApi(EdgeUrlsInfo.addEdge),
        getOpsApi(EdgeUrlsInfo.addEdgeCluster)
      ]
    ]
  })

  return (<>
    {hasCreateEdgePermission &&
      <SpaceWrapper direction='vertical' align='end' size={0}>
        {(isEdgeCompatibilityEnabled && edgeCompatibilities) &&
          <CompatibilityCheck
            data={edgeCompatibilities!.compatibilities ?? []}
            venueId={params.venueId}
          />
        }
        <TenantLink to='/devices/edge/add' key='add'>
          <Button type='link'>{ $t({ defaultMessage: 'Add RUCKUS Edge' }) }</Button>
        </TenantLink>
      </SpaceWrapper>
    }

    <EdgesTable
      tableQuery={tableQuery}
      filterColumns={['venue']}
      settingsId={settingsId}
      incompatibleCheck={isEdgeCompatibilityEnabled}
      filterables={{
        featureIncompatible: featureIncompatible.compatibilitiesFilterOptions
      }}
    />
  </>)
}

const useGetVenueEdgeCompatibilities = (venueId: string | undefined)
: VenueEdgeCompatibilitiesResponseV1_1 | VenueEdgeCompatibilitiesResponse | undefined => {
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const { data: edgeCompatibilities } = useGetVenueEdgeCompatibilitiesQuery({ payload: {
    filters: {
      venueIds: [venueId]
    }
  } }, {
    skip: isEdgeCompatibilityEnhancementEnabled || (!isEdgeCompatibilityEnabled || !venueId)
  })

  const { data: edgeCompatibilitiesV1_1 } = useGetVenueEdgeCompatibilitiesV1_1Query({ payload: {
    filters: {
      venueIds: [venueId]
    }
  } }, {
    skip: !isEdgeCompatibilityEnhancementEnabled || !venueId
  })

  return isEdgeCompatibilityEnhancementEnabled ? edgeCompatibilitiesV1_1 : edgeCompatibilities
}