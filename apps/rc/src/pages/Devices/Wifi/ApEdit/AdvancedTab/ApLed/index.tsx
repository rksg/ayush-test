import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { isEmpty }                from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance }                                                                 from '@acx-ui/components'
import { useGetApLedQuery, useLazyGetVenueLedOnQuery, useLazyGetVenueQuery, useResetApLedMutation, useUpdateApLedMutation } from '@acx-ui/rc/services'
import { ApLedSettings, VenueExtended, VenueLed }                                                                           from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { FieldLabel }                   from '../../styledComponents'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'



export function ApLed () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)


  const { apData: apDetails } = useContext(ApDataContext)

  const formRef = useRef<StepsFormLegacyInstance<ApLedSettings>>()

  const getApLed = useGetApLedQuery({ params: { serialNumber } })

  const [updateApLed, { isLoading: isUpdatingApLed }] = useUpdateApLedMutation()
  const [resetApLed, { isLoading: isResetApLed }] = useResetApLedMutation()

  const [getVenueLed] = useLazyGetVenueLedOnQuery()
  const [getVenue] = useLazyGetVenueQuery()

  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [initData, setInitData] = useState({} as ApLedSettings)
  const [apLed, setApLed] = useState({} as ApLedSettings)
  const [venueLed, setVenueLed] = useState({} as VenueLed)
  const [venue, setVenue] = useState({} as VenueExtended)
  const [formInitializing, setFormInitializing] = useState(true)

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
      unsavedTabKey: 'advanced',
      isDirty: isDirty
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateApLed: () => handleUpdateApLed(form?.getFieldsValue()),
      discardApLedChanges: () => handleDiscard()
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
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        <VenueSettingsHeader venue={venue}
          isUseVenueSettings={isUseVenueSettings}
          handleVenueSetting={handleVenueSetting} />
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
