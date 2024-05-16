import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Switch, Row, Button, Col, Space } from 'antd'
import { useIntl }                                       from 'react-intl'

import { Loader, StepsFormLegacy, showToast, StepsFormLegacyInstance, showActionModal, AnchorContext } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { ApSnmpMibsDownloadInfo }                                                                      from '@acx-ui/rc/components'
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
  VenueExtended,
  ApiVersionEnum
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

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const rbacApiVersion = (isUseRbacApi)? ApiVersionEnum.v1 : undefined

  const { apData: apDetails } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const formRef = useRef<StepsFormLegacyInstance<ApSnmpSettings>>()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [apSnmpSettings, setApSnmpSettings] = useState(defaultApSnmpSettings)
  const [venueApSnmpSettings, setVenueApSnmpSettings] = useState(defaultVenueApSnmpSettings)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(false)
  const [venue, setVenue] = useState({} as VenueExtended)
  const [isApSnmpEnable, setIsApSnmpEnable] = useState(false)
  const [formInitializing, setFormInitializing] = useState(true)
  // eslint-disable-next-line max-len
  const getApSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId }, payload: { rbacApiVersion } })
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

        setReadyToScroll?.(r => [...(new Set(r.concat('AP-SNMP')))])
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
    setApSnmpSettings(apSnmpSettings => apSnmpSettings)
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

  const handleAddApSnmp = async () => {
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


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApSnmpSettings|| isResettingApSnmpSettings
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={() => handleFormApSnmpChange()}
    >
      <StepsFormLegacy.StepForm
        //layout='horizontal'
        initialValues={apSnmpSettings}>
        <VenueSettingsHeader venue={venue}
          isUseVenueSettings={isUseVenueSettings}
          handleVenueSetting={handleVenueSetting}
        />
        <Row>
          <Col span={12}>
            <Space>
              <StepsFormLegacy.FieldLabel
                width='max-content'
                style={{ height: '48px', display: 'flex', alignItems: 'center' }}
              >
                <span>{$t({ defaultMessage: 'Use AP SNMP' })}</span>
                <Form.Item
                  name='enableApSnmp'
                  valuePropName='checked'
                  style={{ marginBottom: '3px' }}
                >
                  <Switch
                    disabled={isUseVenueSettings}
                    data-testid='snmp-switch'
                    style={{ marginLeft: '20px' }}
                  />
                </Form.Item>
              </StepsFormLegacy.FieldLabel>
              {isApSnmpEnable && <>
                <Form.Item name='apSnmpAgentProfileId' style={{ margin: '0' }}>
                  <Select
                    data-testid='snmp-select'
                    disabled={isUseVenueSettings}
                    options={[
                      { label: $t({ defaultMessage: 'Select SNMP Agent...' }), value: '' },
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
                    style={{ marginLeft: '20px' }}
                    onClick={handleAddApSnmp} >
                    {$t({ defaultMessage: 'Add' })}
                  </Button>
                }
              </>
              }
            </Space>
          </Col>
        </Row>
        <ApSnmpMibsDownloadInfo />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>)
}
