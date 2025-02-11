
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }       from '@acx-ui/components'
import {
  useGetPropertyConfigsQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery
} from '@acx-ui/rc/services'
import { PropertyUnit } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

export function PropertyUnitDetails () {
  const { $t } = useIntl()
  const { tenantId, venueId, unitId } = useParams()
  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaGroupById, personaGroupResult] = useLazyGetPersonaGroupByIdQuery()
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [enableGuestUnit, setEnableGuestUnit] = useState<boolean>(true)
  const [personaGroupId, setPersonaGroupId] = useState<string|undefined>(undefined)
  const [withPin, setWithPin] = useState(true)
  const [residentPortalUrl, setResidentPortalUrl] = useState<string|undefined>(undefined)

  useEffect(() => {
    if (!propertyConfigsQuery.isLoading && propertyConfigsQuery.data) {
      const groupId = propertyConfigsQuery.data.personaGroupId
      setPersonaGroupId(groupId)
      setEnableGuestUnit(propertyConfigsQuery.data?.unitConfig?.guestAllowed ?? false)
      getPersonaGroupById({ params: { groupId } })
        .then(result => setWithPin(!!result.data?.personalIdentityNetworkId))
    }
  }, [propertyConfigsQuery.data, propertyConfigsQuery.isLoading ])

  useEffect(() => {
    // // eslint-disable-next-line no-console
    // console.log('reset0 :: ', visible && unitId && venueId && personaGroupId)
    if (unitId && venueId && personaGroupId) {
      getUnitById({ params: { venueId, unitId } })
        .then(result => {
          if (result.data) {
            const { personaId, guestPersonaId } = result.data
            // combinePersonaInfo(result.data, personaId, guestPersonaId)
            const url = (result.data as PropertyUnit)?._links?.residentPortal?.href
            if (url) {
              setResidentPortalUrl(url)
            }
          }
        })
        .catch(() => {
        //   errorCloseDrawer()
        })
    }
  }, [unitId, personaGroupId])

  const breadcrumb = [
    { text: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }), link: '/venues' },
    { text: $t({ defaultMessage: 'Property Units' }),
      link: `/venues/${venueId}/venue-details/units` }
  ]

  return (
    <PageHeader
      title={unitResult.data?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        <Button
        >{$t({ defaultMessage: 'Suspend' })} </Button>,
        <Button
          onClick={() => {
            window.open(residentPortalUrl, '_blank')
          }}
        >{$t({ defaultMessage: 'View Portal' })} </Button>,
        <Button
          type='primary'
        >{$t({ defaultMessage: 'Configure' })} </Button>
      ]}
    />
  )
}
