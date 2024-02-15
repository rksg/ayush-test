import { useEffect, useState, useContext } from 'react'

import { Form, Select, Space, Switch, Button } from 'antd'
import { isEqual }                             from 'lodash'
import { useIntl }                             from 'react-intl'

import { Loader, StepsFormLegacy, showToast, showActionModal, AnchorContext } from '@acx-ui/components'
import {
  useGetApSnmpPolicyListQuery,
  useGetVenueApSnmpSettingsQuery,
  useUpdateVenueApSnmpSettingsMutation
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  VenueApSnmpSettings
} from '@acx-ui/rc/utils'
import {
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../..'

export function ApSnmp () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const navigate = useNavigate()
  const toPolicyPath = useTenantLink('')


  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const [stateOfEnableApSnmp, setEnableApSnmp] = useState(false)
  const [stateOfVenueApSnmpSettings, setStateOfVenueApSnmpSettings] =
  useState({} as VenueApSnmpSettings)

  const RetrievedVenueApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })
  const RetrievedVenueApSnmpAgentOptions =
   RetrievedVenueApSnmpAgentList?.data?.map(m => ({ label: m.policyName, value: m.id })) ?? []

  const RetrievedVenueApSnmpSettings = useGetVenueApSnmpSettingsQuery({ params: { venueId } })
  const RetrievedVenueApSnmpAgentProfileId =
   RetrievedVenueApSnmpSettings?.data?.apSnmpAgentProfileId ?? ''
  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }] =
   useUpdateVenueApSnmpSettingsMutation()

  useEffect(() => {
    const { data: settings, isLoading } = RetrievedVenueApSnmpSettings || {}
    if (isLoading === false && settings) {
      const { enableApSnmp, apSnmpAgentProfileId } = settings
      setEnableApSnmp(enableApSnmp)
      setStateOfVenueApSnmpSettings({ enableApSnmp, apSnmpAgentProfileId })

      setReadyToScroll?.(r => [...(new Set(r.concat('AP-SNMP')))])
    }
  }, [RetrievedVenueApSnmpSettings, setReadyToScroll])

  const handleApSnmpSwitchEnableChange = (newState: boolean) => {
    setEnableApSnmp(newState)
    const newVenueApSnmpSetting =
    { apSnmpAgentProfileId: RetrievedVenueApSnmpAgentProfileId, enableApSnmp: newState }

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: !isEqual(newVenueApSnmpSetting, stateOfVenueApSnmpSettings)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateVenueApSnmp: () => updateVenueApSnmpSetting(newVenueApSnmpSetting),
      discardVenueApSnmp: () => discardVenuedApSnmpChanges(stateOfVenueApSnmpSettings)
    })

  }

  const handleVenueApSnmpOptionChange = (ApSnmpAgentProfileId : string) => {
    const newVenueApSnmpSetting =
    { apSnmpAgentProfileId: ApSnmpAgentProfileId, enableApSnmp: stateOfEnableApSnmp }
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: !isEqual(newVenueApSnmpSetting, stateOfVenueApSnmpSettings)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateVenueApSnmp: () => updateVenueApSnmpSetting(newVenueApSnmpSetting),
      discardVenueApSnmp: () => discardVenuedApSnmpChanges(stateOfVenueApSnmpSettings)
    })

  }

  const updateVenueApSnmpSetting = async (data?: VenueApSnmpSettings) => {

    try {

      // Condition guard, if user didn't change anything, don't send API
      if (data?.enableApSnmp === true && data?.apSnmpAgentProfileId === '') {
        showActionModal({
          type: 'error',
          content: $t({ defaultMessage: 'SNMP agent is required when AP SNMP is enabled' })
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

      /* eslint-disable max-len */
      const payload = data?.enableApSnmp === true ? { ...data } : { enableApSnmp: data?.enableApSnmp }

      if (payload) {
        await updateApSnmpSettings({ params: { venueId } , payload }).unwrap()
      }
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const discardVenuedApSnmpChanges = async (oldData : VenueApSnmpSettings) => {
    setEnableApSnmp(oldData.enableApSnmp ?? false)
  }
  return ( <Loader states={[{
    isLoading: RetrievedVenueApSnmpAgentList.isLoading,
    isFetching: isUpdatingApSnmpSettings
  }]}>
    <Space>
      <StepsFormLegacy.FieldLabel
        width='max-content'
        style={{ height: '48px', display: 'flex', alignItems: 'center' }}
      >
        <span>{$t({ defaultMessage: 'Use AP SNMP' })}</span>
        <Switch
          data-testid='snmp-switch'
          checked={stateOfEnableApSnmp}
          onClick={(newState) => {
            handleApSnmpSwitchEnableChange(newState)
          }}
          style={{ marginLeft: '20px' }}
        />
      </StepsFormLegacy.FieldLabel>
      {stateOfEnableApSnmp && <Form.Item style={{ margin: '0' }}>
        <Select
          data-testid='snmp-select'
          defaultValue={RetrievedVenueApSnmpAgentProfileId}
          options={[
            { label: $t({ defaultMessage: 'Select...' }), value: '' },
            ...RetrievedVenueApSnmpAgentOptions
          ]}
          onChange={(id => {
            handleVenueApSnmpOptionChange(id)
          })}
          style={{ width: '200px' }}
        />
        {((RetrievedVenueApSnmpAgentList?.data?.length as number) < 64) &&
          <Button
            data-testid='use-push'
            type='link'
            style={{ marginLeft: '20px' }}
            onClick={async () => {
              await setEditContextData({
                ...editContextData,
                isDirty: false,
                hasError: false
              })

              const policyRoutePath = getPolicyRoutePath({
                type: PolicyType.SNMP_AGENT,
                oper: PolicyOperation.CREATE
              })
              await navigate(`${toPolicyPath.pathname}/${policyRoutePath}`)
            }}
          >
            {$t({ defaultMessage: 'Add' })}
          </Button>}
      </Form.Item>}
    </Space>
  </Loader>)
}
