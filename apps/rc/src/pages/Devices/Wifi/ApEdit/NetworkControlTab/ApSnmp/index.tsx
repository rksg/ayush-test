import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Switch, Row, Button, Col, Space } from 'antd'
import { useIntl }                                       from 'react-intl'

import { Loader, StepsFormLegacy, showToast, StepsFormLegacyInstance, showActionModal } from '@acx-ui/components'
import {
  useGetApSnmpPolicyListQuery,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation,
  useResetApSnmpSettingsMutation,
  useLazyGetVenueApSnmpSettingsQuery,
  useLazyGetVenueQuery
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  VenueExtended
} from '@acx-ui/rc/utils'
import { VenueApSnmpSettings, ApSnmpSettings } from '@acx-ui/rc/utils'
import {
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext } from '../..'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'

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
  const toPolicyPath = useTenantLink('')

  const {
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)

  const { apData: apDetails } = useContext(ApDataContext)

  const formRef = useRef<StepsFormLegacyInstance<ApSnmpSettings>>()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [apSnmpSettings, setApSnmpSettings] = useState(defaultApSnmpSettings)
  const [venueApSnmpSettings, setVenueApSnmpSettings] = useState(defaultVenueApSnmpSettings)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(false)
  const [venue, setVenue] = useState({} as VenueExtended)
  const [isApSnmpEnable, setIsApSnmpEnable] = useState(false)
  const [formInitializing, setFormInitializing] = useState(true)

  const getApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })
  const getApSnmpSettings = useGetApSnmpSettingsQuery({ params: { serialNumber } })
  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }]
   = useUpdateApSnmpSettingsMutation()

  // Call reset if user want follow venue settings
  const [resetApSnmpSettings, { isLoading: isResettingApSnmpSettings }]
   = useResetApSnmpSettingsMutation()

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueApSnmpSettings] = useLazyGetVenueApSnmpSettingsQuery()

  useEffect(() => {
    const apSnmp = getApSnmpSettings?.data
    if (apSnmp && apDetails) {
      const venueId = apDetails.venueId
      const setData = async () => {
        const apVenue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())

        // Get current Venue AP SNMP settings
        const venueApSnmpSetting = (await getVenueApSnmpSettings({
          params: { tenantId, venueId: apDetails?.venueId } }, true).unwrap()
        )

        setApSnmpSettings({ ...defaultApSnmpSettings, ...apSnmp })
        setVenueApSnmpSettings(venueApSnmpSetting)
        setVenue(apVenue)

        setIsApSnmpEnable(apSnmp.enableApSnmp)
        setIsUseVenueSettings(apSnmp.useVenueSettings)
        isUseVenueSettingsRef.current = apSnmp.useVenueSettings
        setFormInitializing(false)
      }
      setData()
    }
  }, [apDetails, getApSnmpSettings?.data])

  const handleFormApSnmpChange = () => {
    //updateEditContext(formRef?.current as StepsFormLegacyInstance, true)

    // To avoid lost field value when switch is off/fields are removed.
    const newApSnmpSetting : ApSnmpSettings = {
      ...apSnmpSettings,
      ...formRef.current?.getFieldsValue()
    }

    // trigger re-render
    setIsApSnmpEnable(newApSnmpSetting.enableApSnmp)

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networkControl',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: true
    })

    setEditNetworkControlContextData({
      ...editNetworkControlContextData,
      updateApSnmp: () => sendApSnmpSetting(),
      discardApSnmpChanges: () => discardApSnmpChanges()
    })

  }

  const discardApSnmpChanges = async () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      isDirty: false,
      hasError: false
    })

    // Reset all the states and make it identical to the database state
    setApSnmpSettings(apSnmpSettings)
    setIsApSnmpEnable(apSnmpSettings.enableApSnmp)
    setIsUseVenueSettings(apSnmpSettings.useVenueSettings)
    isUseVenueSettingsRef.current = apSnmpSettings.useVenueSettings
  }

  const sendApSnmpSetting = async () => {
    const useVenueSettings = isUseVenueSettingsRef.current
    const payload = {
      ...formRef.current?.getFieldsValue(),
      useVenueSettings: useVenueSettings
    }

    // Condition guard, if user didn't change anything, don't send API
    const { enableApSnmp, apSnmpAgentProfileId='' } = payload
    if (enableApSnmp === true && apSnmpAgentProfileId === '') {
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

      if (useVenueSettings === true) {
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

  const handleVenueSetting = async () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    const settings = (isUseVenue)? venueApSnmpSettings : apSnmpSettings

    formRef?.current?.setFieldsValue(settings)
    // Even though the form is been set again, but it won't trigger rendering, so we need to trigger it manually
    setIsApSnmpEnable(settings.enableApSnmp)

    handleFormApSnmpChange()
  }


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApSnmpSettings|| isResettingApSnmpSettings
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={() => handleFormApSnmpChange()}
    >
      <StepsFormLegacy.StepForm
        layout='horizontal'
        initialValues={apSnmpSettings}>
        <VenueSettingsHeader venue={venue}
          isUseVenueSettings={isUseVenueSettings}
          handleVenueSetting={handleVenueSetting}
        />
        <Row>
          <Col span={12}>
            <Space align='start' size={'large'}>
              <StepsFormLegacy.FieldLabel
                width='max-content'
                style={{ height: '32px', display: 'flex' }}
              >
                <span>{$t({ defaultMessage: 'Use AP SNMP' })}</span>
                <Form.Item
                  name='enableApSnmp'
                  valuePropName='checked'
                >
                  <Switch
                    disabled={isUseVenueSettings}
                    data-testid='ApSnmp-switch'
                    style={{ marginLeft: '20px' }}
                  />
                </Form.Item>
              </StepsFormLegacy.FieldLabel>
              <div style={{ width: '20px' }}></div>
              {isApSnmpEnable && <Space align='center'>
                <StepsFormLegacy.FieldLabel
                  width='max-content'
                  style={{ height: '32px', display: 'flex' }}
                >
                  <span>{$t({ defaultMessage: 'SNMP Agent' })}</span>
                  <Form.Item name='apSnmpAgentProfileId'
                  >
                    <Select
                      data-testid='snmp-select'
                      disabled={isUseVenueSettings}
                      options={[
                        { label: $t({ defaultMessage: 'Select...' }), value: '' },
                        ...getApSnmpAgentList?.data?.map(
                          item => ({ label: item.policyName, value: item.id })
                        ) ?? []
                      ]}
                      style={{ width: '200px', marginLeft: '20px' }}
                    />
                  </Form.Item>
                  {((getApSnmpAgentList?.data?.length as number) < 64) &&
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
                </StepsFormLegacy.FieldLabel>
              </Space>
              }
            </Space>
          </Col>
        </Row>
        {/*
        <Row align='middle'>
          <Col span={3}>
            <Form.Item
              label={$t({ defaultMessage: 'Use AP SNMP' })}
              name='enableApSnmp'
              valuePropName='checked'
              style={{ paddingLeft: '10px',marginBottom: '0px' }}
            >
              <Switch
                disabled={isUseVenueSettings}
                data-testid='ApSnmp-switch'
              />
            </Form.Item>
          </Col>
          {isApSnmpEnable &&
        <Col data-testid='hidden-block' span={12}>
          <Row align='middle'>
            <Form.Item name='apSnmpAgentProfileId'
              label='SNMP Agent'
              style={{ marginBottom: '0px' }}>
              <Select
                data-testid='snmp-select'
                disabled={isUseVenueSettings}
                options={[
                  { label: $t({ defaultMessage: 'Select...' }), value: '' },
                  ...getApSnmpAgentList?.data?.map(
                    item => ({ label: item.policyName, value: item.id })
                  ) ?? []
                ]}
                style={{ width: '200px' }}
              />
            </Form.Item>
            {((getApSnmpAgentList?.data?.length as number) < 64) &&
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
        */}
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>)
}
