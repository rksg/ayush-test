import { useEffect, useState, useContext, useRef } from 'react'

import { Checkbox, Form, Select, Switch, Row } from 'antd'
import { isEqual }                             from 'lodash'
import { useIntl }                             from 'react-intl'

import { Loader, StepsForm, showToast, StepsFormInstance } from '@acx-ui/components'
import {
  useGetApSnmpPolicyListQuery,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation
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

  // const [stateOfEnableApSnmp, setEnableApSnmp] = useState(false)
  const [stateOfApSnmpSettings, setStateOfApSnmpSettings] = useState(defaultApSnmpSettings)

  const RetrievedApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })
  const RetrievedVenueApSnmpSettings = useGetApSnmpSettingsQuery({ params: { serialNumber } })

  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }] =
   useUpdateApSnmpSettingsMutation()

  useEffect(() => {
    const { data: settingsInDatabase, isLoading } = RetrievedVenueApSnmpSettings || {}
    if (isLoading === false && settingsInDatabase) {
      // Store the state of settings from database, reset the form once user discard the changes.
      setStateOfApSnmpSettings(settingsInDatabase)
      // Current state of the settings, allow user change the setting in form fields.
      formRef?.current?.setFieldsValue(settingsInDatabase)
    }
  }, [RetrievedVenueApSnmpSettings])

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
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      await updateApSnmpSettings(
        {
          params: { serialNumber } ,
          payload: { ...stateOfApSnmpSettings, ...formRef.current?.getFieldsValue() }
        }
      ).unwrap()
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }


  return (<Loader states={[{
    isLoading: RetrievedApSnmpAgentList.isLoading,
    isFetching: isUpdatingApSnmpSettings
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
        submit: $t({ defaultMessage: 'Apply AP SNMP Settings' })
      }}
    >
      <StepsForm.StepForm initialValues={RetrievedVenueApSnmpSettings}>
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
        <>
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
            <Form.Item name='useVenueSettings' label='Venue Settings' valuePropName='checked'>
              <Checkbox>{$t({ defaultMessage: 'Use Venue Settings' })}</Checkbox>
            </Form.Item>
          </Row>
          <Row>
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.SNMP_AGENT,
                oper: PolicyOperation.CREATE
              })}
            >
              {$t({ defaultMessage: 'Add SNMP Agent' })}
            </TenantLink>
          </Row>
        </>
        }
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>)
}