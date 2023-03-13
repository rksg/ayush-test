import { useEffect, useState, useContext, useRef } from 'react'

import { Form, Select, Switch, Row, Col, Space, Button } from 'antd'
import { isEmpty }                                       from 'lodash'
import { FormattedMessage, useIntl }                     from 'react-intl'

import { Loader, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useGetApQuery,
  useGetApSnmpPolicyListQuery,
  useGetApSnmpSettingsQuery,
  useLazyGetVenueApSnmpSettingsQuery,
  useLazyGetVenueQuery,
  useResetApSnmpSettingsMutation,
  useUpdateApSnmpSettingsMutation
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  VenueApSnmpSettings,
  VenueExtended
} from '@acx-ui/rc/utils'
import { ApSnmpSettings } from '@acx-ui/rc/utils'
import {
  TenantLink,
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ApEditContext } from '../..'

/*
const defaultApSnmpSettings : ApSnmpSettings = {
  enableApSnmp: false,
  apSnmpAgentProfileId: '',
  useVenueSettings: true
}*/

export function ApSnmp () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const formRef = useRef<StepsFormInstance<ApSnmpSettings>>()

  const { data: apDetails } = useGetApQuery({ params: { tenantId, serialNumber } })
  const getApSnmpSettings = useGetApSnmpSettingsQuery({ params: { serialNumber } })

  const getSnmpAgentList = useGetApSnmpPolicyListQuery({ params: { tenantId } })

  const [updateApSnmpSettings, { isLoading: isUpdatingApSnmpSettings }] =
   useUpdateApSnmpSettingsMutation()
  const [resetApSnmpSettings, { isLoading: isResetApSnmpSettings }] =
    useResetApSnmpSettingsMutation()

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueApSnmp] = useLazyGetVenueApSnmpSettingsQuery()

  const [venue, setVenue] = useState({} as VenueExtended)
  const [initData, setInitData] = useState({} as ApSnmpSettings)
  const [apSnmp, setApSnmp] = useState({} as ApSnmpSettings)
  const [venueApSnmp, setVenueApSnmp] = useState({} as VenueApSnmpSettings)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [formInitializing, setFormInitializing] = useState(true)


  useEffect(() => {
    const apSnmpSettingsData = getApSnmpSettings?.data
    if (apDetails && apSnmpSettingsData &&
        (getSnmpAgentList && getSnmpAgentList.isLoading === false)) {
      const venueId = apDetails.venueId
      const setData = async () => {
        const venue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())

        const venueApSnmpData = (await getVenueApSnmp({
          params: { tenantId, venueId } }, true).unwrap())


        setVenue(venue)
        setVenueApSnmp(venueApSnmpData)
        setIsUseVenueSettings(apSnmpSettingsData.useVenueSettings)

        setInitData(apSnmpSettingsData)
        setFormInitializing(false)
      }

      setData()
    }
  }, [apDetails, getApSnmpSettings?.data, getSnmpAgentList?.data])

  const updateEditContext = (form: StepsFormInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'AP SNMP' }),
      isDirty: isDirty,
      updateChanges: () => handleUpdateApSnmpSettings(form?.getFieldsValue()),
      discardChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings)
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormInstance, true)
  }

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApSnmp({ ...currentData } )
      }

      if (venueApSnmp) {
        const data = {
          ...venueApSnmp,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apSnmp)) {
        formRef?.current?.setFieldsValue(apSnmp)
      }
    }

    updateEditContext(formRef?.current as StepsFormInstance, true)
  }


  const handleUpdateApSnmpSettings = async (values: ApSnmpSettings) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      if (isUseVenueSettings) {
        await resetApSnmpSettings({
          params: { serialNumber }
        }).unwrap()
      } else {
        const payload = {
          ...values,
          useVenueSettings: isUseVenueSettings
        }

        await updateApSnmpSettings({
          params: { serialNumber },
          payload
        }).unwrap()
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApSnmpSettings || isResetApSnmpSettings
  }]}>

    <StepsForm
      formRef={formRef}
      onFormChange={() => handleChange()}
      onFinish={handleUpdateApSnmpSettings}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/wifi/${serialNumber}/details/overview`
      })}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsForm.StepForm initialValues={initData}>
        <Row gutter={20}>
          <Col span={8}>
            <Space style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              paddingBottom: '41px' }}
            >
              { isUseVenueSettings ?
                <FormattedMessage
                  defaultMessage={`
              Currently settings as the venue (<venuelink></venuelink>)
            `}
                  values={{
                    venuelink: () =>
                      <TenantLink
                        to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
                      </TenantLink>
                  }}/>
                : $t({ defaultMessage: 'Custom settings' })
              }
            </Space>
          </Col>
          <Col span={8}>
            <Button type='link' onClick={handleVenueSetting}>
              {isUseVenueSettings ?
                $t({ defaultMessage: 'Customize' }):$t({ defaultMessage: 'Use Venue Settings' })
              }
            </Button>
          </Col>
        </Row>
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
        {apSnmp.enableApSnmp &&
        <>
          <Row>
            <Form.Item name='apSnmpAgentProfileId' label='SNMP Agent'>
              <Select
                data-testid='snmp-select'
                options={[
                  { label: $t({ defaultMessage: 'Select SNMP Agent...' }), value: '' },
                  ...getSnmpAgentList?.data?.map(
                    item => ({ label: item.policyName, value: item.id })
                  ) ?? []
                ]}
                style={{ width: '200px' }}
              />
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
