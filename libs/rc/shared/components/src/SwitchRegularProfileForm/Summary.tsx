import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'


import { StepsFormLegacy }                                                                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                     from '@acx-ui/feature-toggle'
import { useGetVenuesTemplateListQuery, useSwitchPortProfilesListQuery, useVenuesListQuery }          from '@acx-ui/rc/services'
import { PortProfileUI, TableResult, Venue, transformDisplayOnOff, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'

import { ConfigurationProfileFormContext } from './ConfigurationProfileFormContext'
import { portProfilesUIParser }            from './PortProfile/PortProfileModal.utils'

const defaultPayload = {
  searchString: '',
  page: 1,
  pageSize: 10000,
  fields: [
    'name',
    'id'
  ]
}

type PortProfileMap = {
  [key: string]: string
}

export function Summary () {
  const profileOnboardOnlyEnabled = useIsSplitOn(Features.SWITCH_PROFILE_ONBOARD_ONLY)

  const { $t } = useIntl()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchPortProfileToggle = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const { currentData } = useContext(ConfigurationProfileFormContext)

  const [portProfileMap, setPortProfileMap] = useState<PortProfileMap>({})
  const [portProfilesUIData, setPortProfilesUIData] = useState<PortProfileUI[]>([])
  const { data } = useConfigTemplateQueryFnSwitcher<TableResult<Venue>>({
    useQueryFn: useVenuesListQuery,
    useTemplateQueryFn: useGetVenuesTemplateListQuery,
    payload: defaultPayload
  })

  const { data: portProfileData } = useSwitchPortProfilesListQuery({
    payload: defaultPayload,
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !isSwitchPortProfileToggle
  })

  useEffect(() => {
    if(portProfileData?.data){
      const portProfileMap: PortProfileMap = {}

      portProfileData.data.forEach(profile => {
        if(profile.id){
          portProfileMap[profile.id] = profile.name
        }
      })

      setPortProfileMap(portProfileMap)
    }
    if(currentData.portProfiles){
      setPortProfilesUIData(portProfilesUIParser(currentData.portProfiles))
    }
  }, [portProfileData, currentData.portProfiles])

  const venueList = data?.data.reduce<Record<Venue['id'], Venue>>((map, obj) => {
    map[obj.id] = obj
    return map
  }, {})

  const getVenues = function () {
    const venues = currentData.venues
    const rows = []
    if (venues && venues.length > 0) {
      for (const venue of venues) {
        const venueId = venue || ''
        rows.push(
          venueList && venueList[venueId] ? venueList[venueId].name : venueId
        )
      }
    }
    return rows.join(', ')
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title
          children={$t({ defaultMessage: 'Summary' })}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Profile Name:' })}
          children={currentData.name}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description:' })}
          children={currentData.description || $t({ defaultMessage: 'None' })}
        />
        {
          profileOnboardOnlyEnabled &&
          <Form.Item
            label={$t({ defaultMessage: 'Apply profile updates to existing switches:' })}
            children={transformDisplayOnOff(currentData.applyOnboardOnly || false)}
          />
        }
        <Form.Item
          label={$t({ defaultMessage: 'VLANs:' })}
          children={(currentData.vlans && currentData.vlans.length > 0 &&
            currentData.vlans.filter(item => item.vlanName !== 'DEFAULT-VLAN')
              .map((item) => { return item.vlanId })
              .sort((a, b) => Number(a) - Number(b)).join(', ')) ||
            $t({ defaultMessage: 'None' })}
        />
        {isSwitchPortProfileToggle &&
        <Form.Item
          label={$t({ defaultMessage: 'Port Profiles:' })}
          children={
            portProfilesUIData.length > 0 ? (
              <ul>
                {portProfilesUIData.map((item) => (
                  <li key={item.portProfileId[0]} style={{ marginBottom: '10px' }}>
                    {item.models.join(', ')} <br />
                    {item.portProfileId.map((id) => portProfileMap[id as string]).join(', ')}
                  </li>
                ))}
              </ul>
            ) : (
              $t({ defaultMessage: 'None' })
            )
          }
        />
        }
        <Form.Item
          label={$t({ defaultMessage: 'ACLs:' })}
          children={(currentData.acls && currentData.acls.length > 0 &&
            currentData.acls.map((item) => { return item.name }).join(', ')) ||
            $t({ defaultMessage: 'None' })}
        />
        <Form.Item
          label={$t({ defaultMessage: '<VenuePlural></VenuePlural>:' })}
          children={getVenues() || $t({ defaultMessage: 'None' })}
        />
      </Col>
    </Row>
  )
}
