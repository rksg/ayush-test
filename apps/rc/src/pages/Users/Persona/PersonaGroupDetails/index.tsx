import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader, Subtitle, GridRow, GridCol, SummaryCard } from '@acx-ui/components'
import { Features, TierFeatures, useIsTierAllowed }                    from '@acx-ui/feature-toggle'
import {
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  VenueLink,
  PersonaGroupDrawer,
  BasePersonaTable
} from '@acx-ui/rc/components'
import {
  useLazyGetVenueQuery,
  useLazyGetDpskQuery,
  useGetPersonaGroupByIdQuery,
  useLazyGetMacRegListQuery,
  useLazyGetNetworkSegmentationGroupByIdQuery
} from '@acx-ui/rc/services'
import { PersonaGroup }                  from '@acx-ui/rc/utils'
import { EdgeScopes, WifiScopes }        from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { noDataDisplay }                 from '@acx-ui/utils'


function PersonaGroupDetailsPageHeader (props: {
  title?: string,
  onClick: () => void
}) {
  const { $t } = useIntl()
  const { title, onClick } = props

  const extra = filterByAccess([
    <Button type={'primary'} onClick={onClick} scopeKey={[WifiScopes.UPDATE]}>
      {$t({ defaultMessage: 'Configure' })}
    </Button>
  ])

  return (
    <PageHeader
      title={title}
      extra={extra}
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Clients' })
        },
        {
          text: $t({ defaultMessage: 'Identity Management' })
        },
        {
          text: $t({ defaultMessage: 'Identity Groups' }),
          link: 'users/identity-management'
        }
      ]}
    />
  )
}

function PersonaGroupDetails () {
  const { $t } = useIntl()
  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const networkSegmentationEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const { personaGroupId, tenantId } = useParams()
  const [editVisible, setEditVisible] = useState(false)
  const [venueDisplay, setVenueDisplay] = useState<{ id?: string, name?: string }>()
  const [macPoolDisplay, setMacPoolDisplay] = useState<{ id?: string, name?: string }>()
  const [dpskPoolDisplay, setDpskPoolDisplay] = useState<{ id?: string, name?: string }>()
  const [nsgDisplay, setNsgDisplay] = useState<{ id?: string, name?: string }>()

  const [getVenue] = useLazyGetVenueQuery()
  const [getDpskPoolById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getNsgById] = useLazyGetNetworkSegmentationGroupByIdQuery()
  const detailsQuery = useGetPersonaGroupByIdQuery({
    params: { groupId: personaGroupId }
  })

  useEffect(() => {
    if (detailsQuery.isLoading) return

    const { macRegistrationPoolId, dpskPoolId, personalIdentityNetworkId, propertyId }
    = detailsQuery.data as PersonaGroup

    if (macRegistrationPoolId) {
      getMacRegistrationById({ params: { policyId: macRegistrationPoolId } })
        .then(result => {
          if (result.data) {
            setMacPoolDisplay({ id: macRegistrationPoolId, name: result.data.name })
          }
        })
    }

    if (dpskPoolId) {
      getDpskPoolById({ params: { serviceId: dpskPoolId } })
        .then(result => {
          if (result.data) {
            setDpskPoolDisplay({ id: dpskPoolId, name: result.data.name })
          }
        })
    }

    if (personalIdentityNetworkId && networkSegmentationEnabled) {
      let name: string | undefined
      getNsgById({ params: { tenantId, serviceId: personalIdentityNetworkId } })
        .then(result => name = result.data?.name)
        .finally(() => setNsgDisplay({ id: personalIdentityNetworkId, name }))
    }

    if (propertyId) {
      // FIXME: After the property id does not present in UUID format, I will remove .replace()
      const venueId = propertyId.replaceAll('-', '')
      let name: string | undefined
      getVenue({ params: { venueId, tenantId } })
        .then(result => name = result.data?.name)
        .finally(() => setVenueDisplay({ id: venueId, name }))
    }
  }, [detailsQuery.data])

  const basicInfo = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      content:
      <VenueLink
        showNoData={true}
        name={venueDisplay?.name}
        venueId={venueDisplay?.id}
      />
    },
    {
      title: $t({ defaultMessage: 'Identities' }),
      content: detailsQuery.data?.identities?.length ?? 0
    },
    {
      title: $t({ defaultMessage: 'DPSK Service' }),
      content:
      <DpskPoolLink
        showNoData={true}
        name={dpskPoolDisplay?.name}
        dpskPoolId={detailsQuery.data?.dpskPoolId}
      />
    },
    {
      title: $t({ defaultMessage: 'MAC Registration' }),
      content:
        <MacRegistrationPoolLink
          showNoData={true}
          name={macPoolDisplay?.name}
          macRegistrationPoolId={detailsQuery.data?.macRegistrationPoolId}
        />
    },
    ...((networkSegmentationEnabled && hasPermission({ scopes: [EdgeScopes.READ] })) ? [{
      title: $t({ defaultMessage: 'Personal Identity Network' }),
      content:
        <NetworkSegmentationLink
          showNoData={true}
          name={nsgDisplay?.name}
          id={detailsQuery.data?.personalIdentityNetworkId}
        />
    }] : [])
  ]

  return (
    <>
      <PersonaGroupDetailsPageHeader
        title={detailsQuery.data?.name ?? personaGroupId}
        onClick={() => setEditVisible(true)}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SummaryCard
            data={basicInfo}
            colPerRow={6}
            isLoading={detailsQuery.isLoading}
          />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <div>
            <Subtitle level={4}>
              {/* eslint-disable-next-line max-len */}
              {$t({ defaultMessage: 'Identities' })} ({detailsQuery.data?.identities?.length ?? noDataDisplay})
            </Subtitle>
            <BasePersonaTable
              personaGroupId={personaGroupId}
              colProps={{
                name: { searchable: true },
                email: { searchable: true },
                description: { searchable: true },
                groupId: { show: false, filterable: false },
                ...!propertyEnabled
                  ? { identityId: { disable: true, show: false } } : {}
              }}/>
          </div>
        </GridCol>
      </GridRow>

      {detailsQuery.data &&
        <PersonaGroupDrawer
          isEdit
          visible={editVisible}
          data={detailsQuery.data}
          onClose={() => setEditVisible(false)}
        />
      }
    </>
  )
}

export default PersonaGroupDetails
