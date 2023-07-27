import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Switch, Row, Button, Col } from 'antd'
import { isEqual }                                from 'lodash'
import { useIntl }                                from 'react-intl'

import { Loader, StepsFormLegacy, showToast, StepsFormLegacyInstance, showActionModal } from '@acx-ui/components'
import {
  useGetApSnmpPolicyListQuery,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation,
  useResetApSnmpSettingsMutation,
  useLazyGetVenueApSnmpSettingsQuery
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { VenueApSnmpSettings, ApSnmpSettings } from '@acx-ui/rc/utils'
import {
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ApDataContext } from '..'
import { ApEditContext } from '../..'

export function ApSnmp () {


  const defaultVenueApSnmpSettings : VenueApSnmpSettings = {
    enableApSnmp: false,
    apSnmpAgentProfileId: ''
  }
  const defaultApSnmpSettings : ApSnmpSettings = {
    ...defaultVenueApSnmpSettings,
    useVenueSettings: false
  }

  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const toPolicyPath = useTenantLink('')

  const { editContextData, setEditContextData } = useContext(ApEditContext)
  const { apData: apDetails } = useContext(ApDataContext)

  const formRef = useRef<StepsFormLegacyInstance<ApSnmpSettings>>()

  // Store database AP SNMP settings, reset the form once user discard/switch customized settings
  const [stateOfApSnmpSettings, setStateOfApSnmpSettings] = useState(defaultApSnmpSettings)
  // Store database Venue AP SNMP settings, set the form once user click use venue settings
  const [stateOfVenueApSnmpSettings, setStateVenueOfApSnmpSettings]
  = useState(defaultVenueApSnmpSettings)
  // Controlling the disabled of the form fields, switch and the API will be called
  const [stateOfUseVenueSettings, setStateOfUseVenueSettings] = useState(false)
  // Controlling the visible of the form fields
  const [stateOfEnableApSnmp, setStateOfEnableApSnmp] = useState(false)
  // Controlling UI loading
  const [formInitializing, setFormInitializing] = useState(true)

  // Get current Venue AP SNMP Settings
  const [getVenueApSnmpSettings] = useLazyGetVenueApSnmpSettingsQuery()
  // Get current available AP SNMP policy list
  const retrievedApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })
  // Get current AP SNMP settings
  const retrievedApSnmpSettings = useGetApSnmpSettingsQuery({ params: { serialNumber } })

  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }]
   = useUpdateApSnmpSettingsMutation()
  // Call reset if user want follow venue settings
  const [resetApSnmpSettings, { isLoading: isResettingApSnmpSettings }]
   = useResetApSnmpSettingsMutation()

  useEffect(() => {
    const { data: settingsInDatabase, isLoading } = retrievedApSnmpSettings || {}
    if (isLoading === false && settingsInDatabase && apDetails) {
      const setData = async () => {

        // Get current Venue AP SNMP settings
        const venueApSnmpSetting = (
          await getVenueApSnmpSettings(
            { params: { tenantId, venueId: apDetails?.venueId } }, true).unwrap()
        )
        setStateOfApSnmpSettings({ ...defaultApSnmpSettings, ...settingsInDatabase })
        setStateVenueOfApSnmpSettings(venueApSnmpSetting)
        setStateOfEnableApSnmp(settingsInDatabase.enableApSnmp)
        setStateOfUseVenueSettings(settingsInDatabase.useVenueSettings)
        setFormInitializing(false)
      }
      setData()
    }
  }, [apDetails, retrievedApSnmpSettings])

  const handleFormApSnmpChange = () => {
    // To avoid lost field value when switch is off/fields are removed.
    const newApSnmpSetting : ApSnmpSettings
    = {
      ...stateOfApSnmpSettings,
      ...formRef.current?.getFieldsValue(),
      useVenueSettings: stateOfUseVenueSettings
    }

    // trigger re-render
    setStateOfEnableApSnmp(newApSnmpSetting.enableApSnmp)

    setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'AP SNMP' }),
      isDirty: !isEqual(newApSnmpSetting, stateOfApSnmpSettings),
      updateChanges: () => sendApSnmpSetting(),
      discardChanges: () => discardApSnmpChanges()
    })
  }

  const discardApSnmpChanges = async () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      isDirty: false,
      hasError: false
    })

    // Reset all the states and make it identical to the database state
    setStateOfApSnmpSettings(stateOfApSnmpSettings)
    setStateOfEnableApSnmp(stateOfApSnmpSettings.enableApSnmp)
    setStateOfUseVenueSettings(stateOfApSnmpSettings.useVenueSettings)
  }

  const sendApSnmpSetting = async () => {

    const payload
    = {
      ...formRef.current?.getFieldsValue(),
      useVenueSettings: stateOfUseVenueSettings
    }

    // Condition guard, if user didn't change anything, don't send API
    if (payload.enableApSnmp === true && payload.apSnmpAgentProfileId === '') {
      showActionModal({
        type: 'error',
        content: $t({ defaultMessage: 'SNMP agent is required when AP SNMP is enabled' })
      })
      return
    }

    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      if (stateOfUseVenueSettings === true) {
        await resetApSnmpSettings({ params: { serialNumber } }).unwrap()
      } else {
        await updateApSnmpSettings({ params: { serialNumber }, payload }).unwrap()
      }

    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const useVenueSettings = async () => {
    setStateOfUseVenueSettings(true)
    formRef?.current?.setFieldsValue(stateOfVenueApSnmpSettings)
    // Even though the form is been set again, but it won't trigger rendering, so we need to trigger it manually
    setStateOfEnableApSnmp(stateOfVenueApSnmpSettings.enableApSnmp)
  }

  const customize = async () => {
    setStateOfUseVenueSettings(false)
    formRef?.current?.setFieldsValue(stateOfApSnmpSettings)
    // Even though the form is been set again, but it won't trigger rendering, so we need to trigger it manually
    setStateOfEnableApSnmp(stateOfApSnmpSettings.enableApSnmp)
  }


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApSnmpSettings|| isResettingApSnmpSettings
  }]}>

    <StepsFormLegacy
      formRef={formRef}
      onFormChange={() => handleFormApSnmpChange()}
      onFinish={sendApSnmpSetting}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/wifi/${serialNumber}/details/overview`
      })}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsFormLegacy.StepForm
        layout='horizontal'
        initialValues={stateOfApSnmpSettings}>
        <Row
          style={{ backgroundColor: '#F2F2F2', marginBottom: '10px', padding: '6px 0' }}
          align='middle'
        >
          <Col span={8}>
            <p style={{ paddingLeft: '10px', marginBottom: '0px' }}>
              {$t({ defaultMessage: 'Custom  settings' })}
            </p>
          </Col>
          <Col span={8}>
            {stateOfUseVenueSettings ? <Button
              data-testid='use-venue-true'
              type='link'
              onClick={customize}
              style={{ color: '#5598EA' }}
            >
              {$t({ defaultMessage: 'Customize' })}
            </Button>:
              <Button
                data-testid='use-venue-false'
                type='link'
                onClick={useVenueSettings}
                style={{ color: '#5598EA' }}
              >
                {$t({ defaultMessage: 'Use Venue Settings' })}
              </Button>
            }
          </Col>
        </Row>
        <Row align='middle'>
          <Col span={3}>
            <Form.Item
              label={$t({ defaultMessage: 'Use AP SNMP' })}
              name='enableApSnmp'
              valuePropName='checked'
              style={{ paddingLeft: '10px',marginBottom: '0px' }}
            >
              <Switch
                disabled={stateOfUseVenueSettings}
                data-testid='ApSnmp-switch'
              />
            </Form.Item>
          </Col>
          {stateOfEnableApSnmp &&
        <Col data-testid='hidden-block' span={12}>
          <Row align='middle'>
            <Form.Item name='apSnmpAgentProfileId'
              label='SNMP Agent'
              style={{ marginBottom: '0px' }}>
              <Select
                data-testid='snmp-select'
                disabled={stateOfUseVenueSettings}
                options={[
                  { label: $t({ defaultMessage: 'Select...' }), value: '' },
                  ...retrievedApSnmpAgentList?.data?.map(
                    item => ({ label: item.policyName, value: item.id })
                  ) ?? []
                ]}
                style={{ width: '200px' }}
              />
            </Form.Item>
            {((retrievedApSnmpAgentList?.data?.length as number) < 64) &&
              <Button
                data-testid='use-push'
                type='link'
                onClick={async () => {
                  await setEditContextData({
                    ...editContextData,
                    isDirty: false,
                    hasError: false
                  })
                  await navigate(`${toPolicyPath.pathname}/${getPolicyRoutePath({
                    type: PolicyType.SNMP_AGENT,
                    oper: PolicyOperation.CREATE
                  })}`)
                }
                }
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
            }
          </Row>
        </Col>
          }
        </Row>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>)
}
