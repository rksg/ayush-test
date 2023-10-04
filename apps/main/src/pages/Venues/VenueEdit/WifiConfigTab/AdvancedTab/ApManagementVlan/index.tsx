import { useContext, useEffect, useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Loader, StepsFormLegacy, Tooltip }                                         from '@acx-ui/components'
import { useGetVenueApManagementVlanQuery, useUpdateVenueApManagementVlanMutation } from '@acx-ui/rc/services'

import { VenueEditContext } from '../../../index'

export function ApManagementVlan () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)

  const [enableApManagementVlan, setEnableApManagementVlan] = useState(false)
  const getVenueApManagementVlan = useGetVenueApManagementVlanQuery({ params: { venueId } })
  const [updateVenueApManagementVlan, { isLoading: isUpdatingVenueManagementVlan }] =
    useUpdateVenueApManagementVlanMutation()

  useEffect(() => {
    const { data } = getVenueApManagementVlan
    if (!getVenueApManagementVlan?.isLoading) {
      setEnableApManagementVlan(data?.vlanOverrideEnabled ?? false)
    }
  }, [getVenueApManagementVlan])

  const handleChanged = (checked: boolean, vlanId: number) => {
    const newData = { enabled: checked, vlan: vlanId }
    setEnableApManagementVlan(newData.enabled)
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: true
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateApManagementVlan: () => updateApManagementVlan(newData.enabled, newData.vlan)
    })
  }

  const updateApManagementVlan = async (checked: boolean, vlanId: number) => {
    try {
      await updateVenueApManagementVlan({
        params: { tenantId, venueId },
        payload: {
          vlanOverrideEnabled: checked,
          vlanId: vlanId
        }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[{
      isLoading: getVenueApManagementVlan.isLoading,
      isFetching: isUpdatingVenueManagementVlan
    }]}>
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}
        >
          <span>{$t({ defaultMessage: 'AP Management VLAN' })}</span>
          <div style={{ margin: '2px' }}></div>

          
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )

}