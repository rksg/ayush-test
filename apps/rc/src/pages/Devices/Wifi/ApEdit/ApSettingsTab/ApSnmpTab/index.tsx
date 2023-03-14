import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Switch, Row,Button } from 'antd'
import { isEqual }                          from 'lodash'
import { useIntl }                          from 'react-intl'

import { Loader, StepsForm, showToast, StepsFormInstance } from '@acx-ui/components'
import {
  useGetApSnmpPolicyListQuery,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation,
  useResetApSnmpSettingsMutation
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { ApSnmpSettings } from '@acx-ui/rc/utils'
import {
  TenantLink,
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ApEditContext } from '../..'

export function ApSnmp () {

  const defaultApSnmpSettings : ApSnmpSettings = {
    enableApSnmp: false,
    apSnmpAgentProfileId: '',
    useVenueSettings: false
  }

  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const formRef = useRef<StepsFormInstance<ApSnmpSettings>>()

  const [stateOfApSnmpSettings, setStateOfApSnmpSettings] = useState(defaultApSnmpSettings)
  const [formInitializing, setFormInitializing] = useState(true)

  const RetrievedApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })

  const RetrievedApSnmpSettings = useGetApSnmpSettingsQuery({ params: { serialNumber } })

  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }]
   = useUpdateApSnmpSettingsMutation()

  const [resetApSnmpSettings, { isLoading: isResettingApSnmpSettings }]
   = useResetApSnmpSettingsMutation()

  useEffect(() => {
    const { data: settingsInDatabase, isLoading } = RetrievedApSnmpSettings || {}
    if (isLoading === false && settingsInDatabase) {
      // Store the state of settings from database, reset the form once user discard the changes.
      setStateOfApSnmpSettings(settingsInDatabase)
      setFormInitializing(false)
    }
  }, [RetrievedApSnmpSettings])

  const handleFormApSnmpChange = () => {
    // To avoid formRef might lost some of the properties
    const newApSnmpSetting = { ...stateOfApSnmpSettings, ...formRef.current?.getFieldsValue() }

    setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'AP SNMP' }),
      isDirty: !isEqual(newApSnmpSetting, stateOfApSnmpSettings),
      updateChanges: () => sendApSnmpSetting(),
      discardChanges: () => discardApSnmpChanges()
    })
  }

  const discardApSnmpChanges = async () => {
    // Reset all the states and make it identical to the database state
    setStateOfApSnmpSettings(stateOfApSnmpSettings)
  }

  const sendApSnmpSetting = async () => {

    const payload = { ...stateOfApSnmpSettings, ...formRef.current?.getFieldsValue() }

    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      await updateApSnmpSettings({ params: { serialNumber }, payload }).unwrap()

    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const useVenueSettings = async () => {

    await resetApSnmpSettings({ params: { serialNumber } }).unwrap()

    await RetrievedApSnmpSettings.refetch()

    const newStateOfApSnmpSettings
    = { ...formRef.current?.getFieldsValue(), ...RetrievedApSnmpSettings.data!! }

    setStateOfApSnmpSettings(newStateOfApSnmpSettings)

    formRef?.current?.setFieldsValue(newStateOfApSnmpSettings)
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
        submit: $t({ defaultMessage: 'Apply Settings' })
      }}
    >
      <StepsForm.StepForm initialValues={stateOfApSnmpSettings}>
        <Row>
          <Form.Item
            label={$t({ defaultMessage: 'AP SNMP' })}
            name='enableApSnmp'
            valuePropName='checked'
          >
            <Switch
              data-testid='ApSnmp-switch'
            />
          </Form.Item>
        </Row>
        {stateOfApSnmpSettings.enableApSnmp &&
        <div data-testid='hidden-block'>
          <Row>
            <Form.Item name='apSnmpAgentProfileId' label='Select SNMP Agent'>
              <Select
                data-testid='snmp-select'
                options={[
                  { label: $t({ defaultMessage: 'Select SNMP Agent...' }), value: '' },
                  ...RetrievedApSnmpAgentList?.data?.map(
                    item => ({ label: item.policyName, value: item.id })
                  ) ?? []
                ]}
                style={{ width: '200px' }}
              />
            </Form.Item>
          </Row>
          <Row>
            <Button
              type='link'
              onClick={useVenueSettings}
              style={{ paddingLeft: '0px' }}>
              {$t({ defaultMessage: 'Use Venue Settings' })}
            </Button>
          </Row>
          <Row>
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.SNMP_AGENT,
                oper: PolicyOperation.CREATE
              })}
              style={{ paddingTop: '5px' }}
            >
              {$t({ defaultMessage: 'Add SNMP Agent' })}
            </TenantLink>
          </Row>
        </div>
        }
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>)
}
