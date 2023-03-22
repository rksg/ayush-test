import { useEffect, useState } from 'react'

import { Descriptions } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { noDataSymbol }                                                 from '@acx-ui/analytics/utils'
import { Button, Card, Loader, PageHeader, Subtitle, GridRow, GridCol } from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import {
  useLazyGetVenueQuery,
  useLazyGetDpskQuery,
  useGetPersonaGroupByIdQuery,
  useLazyGetMacRegListQuery,
  useLazyGetNetworkSegmentationGroupByIdQuery
} from '@acx-ui/rc/services'
import { PersonaGroup }   from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { DpskPoolLink, MacRegistrationPoolLink, NetworkSegmentationLink, VenueLink } from '../LinkHelper'
import { PersonaGroupDrawer }                                                        from '../PersonaGroupDrawer'
import { BasePersonaTable }                                                          from '../PersonaTable/BasePersonaTable'

function PersonaGroupDetailsPageHeader (props: {
  title?: string,
  onClick: () => void
}) {
  const { $t } = useIntl()
  const { title, onClick } = props

  const extra = filterByAccess([
    <Button type={'primary'} onClick={onClick}>
      {$t({ defaultMessage: 'Configure' })}
    </Button>
  ])

  return (
    <PageHeader
      title={title}
      extra={extra}
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Persona Group' }),
          link: 'users/persona-management'
        }
      ]}
    />
  )
}

function PersonaGroupDetails () {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)
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

    const { macRegistrationPoolId, dpskPoolId, nsgId, propertyId }
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

    if (nsgId && networkSegmentationEnabled) {
      let name: string | undefined
      getNsgById({ params: { serviceId: nsgId } })
        .then(result => name = result.data?.name)
        .finally(() => setNsgDisplay({ id: nsgId, name }))
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
      title: $t({ defaultMessage: 'Venue' }),
      value:
      <VenueLink
        name={venueDisplay?.name}
        venueId={venueDisplay?.id}
      />
    },
    {
      title: $t({ defaultMessage: 'Personas' }),
      value: detailsQuery.data?.personas?.length ?? 0
    },
    {
      title: $t({ defaultMessage: 'DPSK Pool' }),
      value:
      <DpskPoolLink
        name={dpskPoolDisplay?.name}
        dpskPoolId={detailsQuery.data?.dpskPoolId}
      />
    },
    {
      title: $t({ defaultMessage: 'MAC Registration' }),
      value:
        <MacRegistrationPoolLink
          name={macPoolDisplay?.name}
          macRegistrationPoolId={detailsQuery.data?.macRegistrationPoolId}
        />
    },
    {
      title: $t({ defaultMessage: 'Network Segmentation' }),
      value:
        <NetworkSegmentationLink
          name={nsgDisplay?.name}
          nsgId={detailsQuery.data?.nsgId}
        />
    }
  ]

  return (
    <>
      <PersonaGroupDetailsPageHeader
        title={detailsQuery.data?.name ?? personaGroupId}
        onClick={() => setEditVisible(true)}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[detailsQuery]}>
            <Card type={'solid-bg'}>
              <Descriptions
                layout={'vertical'}
                column={7}
                size={'small'}
                colon={false}
                style={{ padding: '8px 14px' }}
              >
                {
                  basicInfo.map(info =>
                    <Descriptions.Item
                      key={info.title}
                      label={info.title}
                    >
                      {info.value ?? noDataSymbol}
                    </Descriptions.Item>
                  )
                }
              </Descriptions>
            </Card>
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <div>
            <Subtitle level={4}>
              {/* eslint-disable-next-line max-len */}
              {$t({ defaultMessage: 'Personas' })} ({detailsQuery.data?.personas?.length ?? noDataSymbol})
            </Subtitle>

            <BasePersonaTable
              colProps={{
                name: { searchable: true },
                groupId: { show: false, filterable: false }
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
