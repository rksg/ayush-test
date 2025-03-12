import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader, Subtitle, SummaryCard } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                    from '@acx-ui/feature-toggle'
import {
  BasePersonaTable,
  CertTemplateLink,
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PersonaGroupDrawer,
  PolicySetLink,
  VenueLink,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import {
  useGetPersonaGroupByIdQuery,
  useLazyGetCertificateTemplateQuery,
  useLazyGetDpskQuery,
  useLazyGetMacRegListQuery,
  useLazyGetEdgePinByIdQuery,
  useLazyGetVenueQuery,
  useLazyGetAdaptivePolicySetQuery
} from '@acx-ui/rc/services'
import { PersonaGroup, PersonaUrls }                    from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                   from '@acx-ui/react-router-dom'
import { filterByOperations, hasCrossVenuesPermission } from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                     from '@acx-ui/utils'


function PersonaGroupDetailsPageHeader (props: {
  title?: string,
  onClick: () => void
}) {
  const { $t } = useIntl()
  const { title, onClick } = props

  const extra = hasCrossVenuesPermission({ needGlobalPermission: true })
    ? [
      <Button
        type={'primary'}
        onClick={onClick}
        rbacOpsIds={[getOpsApi(PersonaUrls.updatePersonaGroup)]}
      >
        {$t({ defaultMessage: 'Configure' })}
      </Button>
    ] : []

  return (
    <PageHeader
      title={title}
      extra={filterByOperations(extra)}
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
  const basePath = useTenantLink('users/identity-management/identity-group')
  const navigate = useNavigate()
  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const networkSegmentationEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isCertTemplateEnable = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isIdentityRefactorEnabled = useIsSplitOn(Features.IDENTITY_UI_REFACTOR)

  const { personaGroupId, tenantId } = useParams()
  const [editVisible, setEditVisible] = useState(false)
  const [venueDisplay, setVenueDisplay] = useState<{ id?: string, name?: string }>()
  const [macPoolDisplay, setMacPoolDisplay] = useState<{ id?: string, name?: string }>()
  const [dpskPoolDisplay, setDpskPoolDisplay] = useState<{ id?: string, name?: string }>()
  const [pinDisplay, setPinDisplay] = useState<{ id?: string, name?: string }>()
  const [certTemplateDisplay, setCertTemplateDisplay] = useState<{ id?: string, name?: string }>()
  const [policySetDisplay, setPolicySetDisplay] = useState<{ id?: string, name?: string }>()

  const [getVenue] = useLazyGetVenueQuery()
  const [getDpskPoolById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getPinById] = useLazyGetEdgePinByIdQuery()
  const [getCertTemplateById] = useLazyGetCertificateTemplateQuery()
  const [ getPolicySetById ] = useLazyGetAdaptivePolicySetQuery()
  const detailsQuery = useGetPersonaGroupByIdQuery({
    params: { groupId: personaGroupId }
  })

  useEffect(() => {
    if (detailsQuery.isLoading) return

    const {
      macRegistrationPoolId,
      dpskPoolId,
      personalIdentityNetworkId,
      propertyId,
      certificateTemplateId,
      policySetId
    } = detailsQuery.data as PersonaGroup

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
      getPinById({ params: { tenantId, serviceId: personalIdentityNetworkId } })
        .then(result => name = result.data?.name)
        .finally(() => setPinDisplay({ id: personalIdentityNetworkId, name }))
    }

    if (propertyId) {
      // FIXME: After the property id does not present in UUID format, I will remove .replace()
      const venueId = propertyId.replaceAll('-', '')
      let name: string | undefined
      getVenue({ params: { venueId, tenantId } })
        .then(result => name = result.data?.name)
        .finally(() => setVenueDisplay({ id: venueId, name }))
    }

    if (isCertTemplateEnable && certificateTemplateId) {
      getCertTemplateById({ params: { policyId: certificateTemplateId } })
        .then(result => {
          setCertTemplateDisplay({
            id: certificateTemplateId,
            name: result?.data?.name
          })
        })
    }

    if (policySetId) {
      getPolicySetById({ params: { policySetId } })
        .then(result => {
          setPolicySetDisplay({
            id: policySetId,
            name: result?.data?.name
          })
        })
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
    ...(networkSegmentationEnabled ? [{
      title: $t({ defaultMessage: 'Personal Identity Network' }),
      content:
        <NetworkSegmentationLink
          showNoData={true}
          name={pinDisplay?.name}
          id={detailsQuery.data?.personalIdentityNetworkId}
        />
    }] : []),
    ...(isCertTemplateEnable ? [{
      title: $t({ defaultMessage: 'Certificate Template' }),
      content:
        <CertTemplateLink
          showNoData={true}
          name={certTemplateDisplay?.name}
          id={detailsQuery.data?.certificateTemplateId}
        />
    }] : []),
    ...(isCertTemplateEnable ? [{
      title: $t({ defaultMessage: 'Adaptive Policy' }),
      content:
        <PolicySetLink
          showNoData={true}
          name={policySetDisplay?.name}
          id={detailsQuery.data?.policySetId}
        />
    }] : [])
  ]

  return (
    <>
      <PersonaGroupDetailsPageHeader
        title={detailsQuery.data?.name ?? personaGroupId}
        onClick={() => {
          if (isIdentityRefactorEnabled) {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/${personaGroupId}/edit`
            })
          } else {
            setEditVisible(true)
          }
        }}
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
