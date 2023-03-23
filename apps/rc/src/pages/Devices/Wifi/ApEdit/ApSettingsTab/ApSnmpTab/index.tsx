import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Switch, Row, Button, Col } from 'antd'
import { isEqual }                                from 'lodash'
import { useIntl }                                from 'react-intl'

import { Loader, StepsForm, showToast, StepsFormInstance } from '@acx-ui/components'
import {
  useGetApQuery,
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
  TenantLink,
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

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

  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const formRef = useRef<StepsFormInstance<ApSnmpSettings>>()

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

  // Get AP Details for Venue ID
  const { data: RetrievedApDetails } = useGetApQuery({ params: { tenantId, serialNumber } })
  // Get current Venue AP SNMP Settings
  const [getVenueApSnmpSettings] = useLazyGetVenueApSnmpSettingsQuery()
  // Get current available AP SNMP policy list
  const RetrievedApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })
  // Get current AP SNMP settings
  const RetrievedApSnmpSettings = useGetApSnmpSettingsQuery({ params: { serialNumber } })

  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }]
   = useUpdateApSnmpSettingsMutation()
  // Call reset if user want follow venue settings
  const [resetApSnmpSettings, { isLoading: isResettingApSnmpSettings }]
   = useResetApSnmpSettingsMutation()

  useEffect(() => {
    const { data: settingsInDatabase, isLoading } = RetrievedApSnmpSettings || {}
    if (isLoading === false && settingsInDatabase && RetrievedApDetails) {
      const setData = async () => {

        // Get current Venue AP SNMP settings
        const venueApSnmpSetting = (
          await getVenueApSnmpSettings(
            { params: { tenantId, venueId: RetrievedApDetails?.venueId } }, true).unwrap()
        )
        setStateOfApSnmpSettings(settingsInDatabase)
        setStateVenueOfApSnmpSettings(venueApSnmpSetting)
        setStateOfEnableApSnmp(settingsInDatabase.enableApSnmp)
        setStateOfUseVenueSettings(settingsInDatabase.useVenueSettings)
        setFormInitializing(false)
      }
      setData()
    }
  }, [RetrievedApSnmpSettings])

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

    const payload : ApSnmpSettings
    = {
      ...stateOfApSnmpSettings,
      ...formRef.current?.getFieldsValue(),
      useVenueSettings: stateOfUseVenueSettings
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
  }


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApSnmpSettings|| isResettingApSnmpSettings
  }]}>

    <StepsForm
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
      <StepsForm.StepForm
        layout='horizontal'
        initialValues={stateOfApSnmpSettings}>
        <Row style={{ backgroundColor: '#F2F2F2', marginBottom: '10px' }} align='middle'>
          <Col span={3}>
            <p style={{ paddingLeft: '10px', marginBottom: '0px' }}>Cutsom  settings</p>
          </Col>
          <Col span={3}>
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
            <Col span={10}>
              <Form.Item name='apSnmpAgentProfileId'
                label='SNMP Agent'
                style={{ marginBottom: '0px' }}>
                <Select
                  data-testid='snmp-select'
                  disabled={stateOfUseVenueSettings}
                  options={[
                    { label: $t({ defaultMessage: 'Select...' }), value: '' },
                    ...RetrievedApSnmpAgentList?.data?.map(
                      item => ({ label: item.policyName, value: item.id })
                    ) ?? []
                  ]}
                  style={{ width: '200px' }}
                />
              </Form.Item>
            </Col>
            {((RetrievedApSnmpAgentList?.data?.length as number) < 64) && <Col span={12}>
              <TenantLink
                to={getPolicyRoutePath({
                  type: PolicyType.SNMP_AGENT,
                  oper: PolicyOperation.CREATE
                })}
              >
                {$t({ defaultMessage: 'Add' })}
              </TenantLink>
            </Col>}
          </Row>
        </Col>
          }
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>)
}
