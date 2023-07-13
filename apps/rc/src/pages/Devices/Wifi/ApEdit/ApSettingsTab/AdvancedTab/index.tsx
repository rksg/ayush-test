import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Space, Switch } from 'antd'
import { FormattedMessage, useIntl }     from 'react-intl'
import { useNavigate, useParams }        from 'react-router-dom'

import { Button, Loader, StepsFormLegacy, StepsFormLegacyInstance }                                                         from '@acx-ui/components'
import { useGetApLedQuery, useLazyGetVenueLedOnQuery, useLazyGetVenueQuery, useResetApLedMutation, useUpdateApLedMutation } from '@acx-ui/rc/services'
import { ApLedSettings, VenueExtended, VenueLed, isEmpty, redirectPreviousPage }                                            from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                        from '@acx-ui/react-router-dom'

import { ApDataContext } from '..'
import { ApEditContext } from '../..'
import { FieldLabel }    from '../styledComponents'

export function Advanced () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const {
    editContextData,
    setEditContextData,
    previousPath
  } = useContext(ApEditContext)

  const formRef = useRef<StepsFormLegacyInstance<ApLedSettings>>()

  const { apData: apDetails } = useContext(ApDataContext)
  const [getVenue] = useLazyGetVenueQuery()
  const getApLed = useGetApLedQuery({ params: { serialNumber } })
  const [getVenueLed] = useLazyGetVenueLedOnQuery()
  const [updateApLed, { isLoading: isUpdatingApLed }] =
    useUpdateApLedMutation()
  const [resetApLed, { isLoading: isResetApLed }] =
    useResetApLedMutation()

  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [initData, setInitData] = useState({} as ApLedSettings)
  const [apLed, setApLed] = useState({} as ApLedSettings)
  const [venueLed, setVenueLed] = useState({} as VenueLed)

  const [formInitializing, setFormInitializing] = useState(true)

  const [venue, setVenue] = useState({} as VenueExtended)

  useEffect(() => {
    const apLedData = getApLed?.data
    if (apDetails && apLedData) {
      const venueId = apDetails.venueId
      const setData = async () => {
        const apVenue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())
        const venueLed = await getVenueLed({ params: { tenantId, venueId } }, true).unwrap()

        setVenue(apVenue)
        setVenueLed(venueLed?.find(apModel => apModel.model === apDetails?.model)
          || { ledEnabled: true } as VenueLed)
        setIsUseVenueSettings(apLedData.useVenueSettings)
        isUseVenueSettingsRef.current = apLedData.useVenueSettings

        setInitData(apLedData)
        setFormInitializing(false)
      }

      setData()
    }
  }, [ apDetails, getApLed?.data ])

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApLed({ ...currentData } )
      }

      if (venueLed) {
        const data = {
          ...venueLed,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apLed)) {
        formRef?.current?.setFieldsValue(apLed)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const handleUpdateApLed = async (values: ApLedSettings) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      const isUseVenue = isUseVenueSettingsRef.current

      if (isUseVenue) {
        await resetApLed({
          params: { serialNumber }
        }).unwrap()
      } else {
        const payload = {
          ...values,
          useVenueSettings: false
        }

        await updateApLed({
          params: { serialNumber },
          payload
        }).unwrap()
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings)
    isUseVenueSettingsRef.current = initData.useVenueSettings
    formRef?.current?.setFieldsValue(initData)
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: isDirty,
      updateChanges: () => handleUpdateApLed(form?.getFieldsValue()),
      discardChanges: () => handleDiscard()
    })
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApLed || isResetApLed
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={handleChange}
      onFinish={handleUpdateApLed}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        <Row gutter={20}>
          <Col span={8}>
            <Space style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              paddingBottom: '20px' }}
            >
              { isUseVenueSettings ?
                <FormattedMessage
                  defaultMessage={`
              Currently settings as the venue (<venuelink></venuelink>)
            `}
                  values={{
                    venuelink: () => venue?
                      <TenantLink
                        to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
                      </TenantLink>: ''
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
        <Row gutter={0} style={{ height: '40px' }}>
          <Col span={8}>
            <FieldLabel width='180px' >
              {$t({ defaultMessage: 'Access Point LEDs' })}
              <Form.Item
                name='ledEnabled'
                valuePropName='checked'
                style={{ marginTop: '-5px' }}
                children={isUseVenueSettings
                  ?<span data-testid='ApLed-text'>
                    {venueLed?.ledEnabled ? $t({ defaultMessage: 'On' })
                      : $t({ defaultMessage: 'Off' })}</span>
                  :<Switch data-testid='ApLed-switch'/>
                }
              />
            </FieldLabel>
          </Col>
        </Row>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>
  )
}
