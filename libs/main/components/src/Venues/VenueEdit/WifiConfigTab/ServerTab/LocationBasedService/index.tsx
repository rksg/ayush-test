/* eslint-disable max-len */
import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Space, Switch, Button } from 'antd'
import { isEqual }                             from 'lodash'
import { useIntl }                             from 'react-intl'

import { Loader, StepsFormLegacy, showToast, showActionModal, AnchorContext } from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures,
  LBS_SERVER_PROFILE_MAX_COUNT,
  LbsServerProfileDrawer
} from '@acx-ui/rc/components'
import {
  useGetLbsServerProfileListQuery,
  useActivateLbsServerProfileOnVenueMutation,
  useDeactivateLbsServerProfileOnVenueMutation
} from '@acx-ui/rc/services'
import { hasPolicyPermission, PolicyOperation, PolicyType, VenueLbsActivationType } from '@acx-ui/rc/utils'
import { useParams }                                                                from '@acx-ui/react-router-dom'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'

export function LocationBasedService (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const profileIdRef = useRef<string>('')

  const activateLbsServerProfile = useLbsServerProfileActivation()
  const deactivateLbsServerProfile = useLbsServerProfileDeactivation()

  const defaultPayload = {
    fields: ['name', 'id', 'venueIds'],
    pageSize: 100,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)

  const { setReadyToScroll } = useContext(AnchorContext)
  const [stateOfEnableLbs, setEnableLbs] = useState(false)
  const [stateOfVenueLbs, setStateOfVenueLbs] =
    useState<VenueLbsActivationType>({ enableLbs: false })
  const [stateOfLbsServerProfileId, setStateOfLbsServerProfileId] = useState<string>()
  const [showLbsServerProfileDrawer, setShowLbsServerProfileDrawer] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  const { selectOptions, lbsServerProfileId, enableLbs, isLoading } =
    useGetLbsServerProfileListQuery({ payload: defaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        const d = data?.data
        const selectOptions = d?.map(item => ({ label: item.name, value: item.id })) ?? []
        const lbsServerProfileId = venueId && d?.filter(item => item.venueIds
          ?.includes(venueId)).map(item => item.id)?.at(0) || ''
        const enableLbs = !!lbsServerProfileId
        return {
          isLoading,
          enableLbs: enableLbs,
          selectOptions: selectOptions,
          lbsServerProfileId: lbsServerProfileId
        }
      }
    })

  useEffect(() => {
    if (!isLoading) {
      setEnableLbs(enableLbs)
      setStateOfVenueLbs({ enableLbs, lbsServerProfileId })
      setStateOfLbsServerProfileId(lbsServerProfileId)
    }
    setReadyToScroll?.(r => [...(new Set(r.concat('Location-Based-Service')))])
  }, [enableLbs, lbsServerProfileId])

  const handleLbsSwitchEnableChange = (newState: boolean) => {
    setEnableLbs(newState)
    profileIdRef.current = lbsServerProfileId
    const newVenueLbs =
      { lbsServerProfileId: lbsServerProfileId, enableLbs: newState }

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: !isEqual(newVenueLbs, stateOfVenueLbs)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateVenueLbs: () => updateVenueLbs(newVenueLbs),
      discardVenueLbs: () => discardVenuedLbsChanges(stateOfVenueLbs)
    })

  }

  const handleVenueLbsOptionChange = (selectedLbsServerProfileId: string) => {
    const newVenueLbs =
      { lbsServerProfileId: selectedLbsServerProfileId, enableLbs: stateOfEnableLbs }
    setStateOfLbsServerProfileId(selectedLbsServerProfileId)
    profileIdRef.current = selectedLbsServerProfileId
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: !isEqual(newVenueLbs, stateOfVenueLbs)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateVenueLbs: () => updateVenueLbs(newVenueLbs),
      discardVenueLbs: () => discardVenuedLbsChanges(stateOfVenueLbs)
    })

  }

  const updateVenueLbs = async (data: VenueLbsActivationType) => {
    try {
      // Condition guard, if user didn't change anything, don't send API
      if (data?.enableLbs === true && data?.lbsServerProfileId === '') {
        showActionModal({
          type: 'error',
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'LBS server profile is required when LBS server is enabled' })
        })
        return
      }

      setEditContextData && setEditContextData({
        ...editContextData,
        unsavedTabKey: 'servers',
        tabTitle: $t({ defaultMessage: 'Network Control' }),
        isDirty: false,
        hasError: false
      })

      if (data) {
        if (data && data.enableLbs) {
          await activateLbsServerProfile(venueId, profileIdRef.current)
        } else if (data && !data.enableLbs) {
          await deactivateLbsServerProfile(venueId, profileIdRef.current)
        }
      }
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  function useLbsServerProfileActivation () {
    const [activate] = useActivateLbsServerProfileOnVenueMutation()
    const activateLbsServerProfile =
      async (venueId?: string, policyId?: string) => {
        return venueId && policyId ?
          await activate({ params: { venueId, policyId } }).unwrap() : null
      }

    return activateLbsServerProfile
  }

  function useLbsServerProfileDeactivation () {
    const [deactivate] = useDeactivateLbsServerProfileOnVenueMutation()
    const deactivateLbsServerProfile =
      async (venueId?: string, policyId?: string) => {
        return venueId && policyId ?
          await deactivate({ params: { venueId, policyId } }).unwrap() : null
      }

    return deactivateLbsServerProfile
  }

  const discardVenuedLbsChanges = async (oldData: VenueLbsActivationType) => {
    setEnableLbs(oldData.enableLbs ?? false)
    setStateOfLbsServerProfileId(oldData.lbsServerProfileId ?? '')
  }

  const handleAddLbsServerProfile = () => {
    setShowLbsServerProfileDrawer(true)
  }

  const handleSaveLbsServerProfile = (id?: string) => {
    if (id) {
      handleVenueLbsOptionChange(id)
    }
    setShowLbsServerProfileDrawer(false)
  }

  return (
    <Loader states={[{ isLoading: isLoading }]}>
      <Space>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ height: '48px', display: 'flex', alignItems: 'center' }}
        >
          <span>{$t({ defaultMessage: 'Use LBS Server' })}</span>
          <div style={{ margin: '2px' }}></div>
          {isR370UnsupportedFeatures && <ApCompatibilityToolTip
            title={''}
            showDetailButton
            placement='bottom'
            onClick={() => setDrawerVisible(true)}
          />}
          <Switch
            data-testid='lbs-switch'
            disabled={!isAllowEdit}
            checked={stateOfEnableLbs}
            onClick={(newState) => {
              handleLbsSwitchEnableChange(newState)
            }}
            style={{ marginLeft: '20px' }}
          />
          {isR370UnsupportedFeatures && <ApCompatibilityDrawer
            visible={drawerVisible}
            type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
            venueId={venueId}
            featureName={InCompatibilityFeatures.LOCATION_BASED_SERVICE}
            onClose={() => setDrawerVisible(false)}
          />}
        </StepsFormLegacy.FieldLabel>
        {stateOfEnableLbs && <Form.Item style={{ margin: '0' }}>
          <Select
            data-testid='lbs-select'
            disabled={!isAllowEdit}
            value={stateOfLbsServerProfileId}
            options={[
              { label: $t({ defaultMessage: 'Select...' }), value: '' },
              ...selectOptions
            ]}
            onChange={(id => {
              handleVenueLbsOptionChange(id)
            })}
            style={{ width: '200px' }}
          />
          {isAllowEdit &&
           hasPolicyPermission({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.CREATE }) &&
          <Button
            disabled={selectOptions.length >= LBS_SERVER_PROFILE_MAX_COUNT}
            type='link'
            style={{ marginLeft: '20px' }}
            onClick={handleAddLbsServerProfile}
          >
            {$t({ defaultMessage: 'Add' })}
          </Button>}
        </Form.Item>}
      </Space>
      <LbsServerProfileDrawer
        visible={showLbsServerProfileDrawer}
        setVisible={setShowLbsServerProfileDrawer}
        handleSave={handleSaveLbsServerProfile}
      />
    </Loader>)
}
