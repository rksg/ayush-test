/*
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { isEmpty }                from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { useLazyGetVenueQuery }                             from '@acx-ui/rc/services'
import { VenueExtended, VenueLed }                          from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { FieldLabel }                   from '../../styledComponents'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'
*/


export function BssColoring () {

  return (
    <div> Bss Coloring is implementing </div>
  )
  /*
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)


  const { apData: apDetails } = useContext(ApDataContext)

  const formRef = useRef<StepsFormLegacyInstance<ApBssColoringSettings>>()

  const getApBssColoring = useGetApBssColoringQuery({ params: { serialNumber } })

  const [updateApBssColoring, { isLoading: isUpdatingBssColoring }]
    = useUpdateApBssColoringMutation()
  const [resetApBssColoring, { isLoading: isResetBssColoring }]
    = useResetApBssColoringMutation()

  const [getVenueBssColoring] = useLazyGetVenueBssColoringQuery()

  const [getVenue] = useLazyGetVenueQuery()

  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [initData, setInitData] = useState({})
  const [apBssColoring, setApBssColoring] = useState({})
  const [venueBssColoring, setVenueBssColoring] = useState({} as VenueLed)
  const [venue, setVenue] = useState({} as VenueExtended)
  const [formInitializing, setFormInitializing] = useState(true)

  useEffect(() => {
    const apBssColoringData = getApBssColoring?.data
    if (apDetails && apBssColoringData) {
      const venueId = apDetails.venueId
      const setData = async () => {
        const apVenue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())
        const venueBssColoringData = (await getVenueBssColoring({
          params: { tenantId, venueId } }, true).unwrap())

        setVenue(apVenue)
        setVenueBssColoring(venueBssColoringData)
        setIsUseVenueSettings(apBssColoringData.useVenueSettings)
        isUseVenueSettingsRef.current = apBssColoringData.useVenueSettings

        setInitData(apBssColoringData)
        setFormInitializing(false)
      }

      setData()
    }
  }, [ apDetails, getApBssColoring?.data ])

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApBssColoring({ ...currentData } )
      }

      if (venueBssColoring) {
        const data = {
          ...venueBssColoring,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apBssColoring)) {
        formRef?.current?.setFieldsValue(apBssColoring)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const handleUpdateApBssColoring = async (values: ApBssColoringSettings) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      const isUseVenue = isUseVenueSettingsRef.current

      if (isUseVenue) {
        await resetApBssColoring({
          params: { serialNumber }
        }).unwrap()
      } else {
        const payload = {
          ...values,
          useVenueSettings: false
        }

        await updateApBssColoring({
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
      updateBssColoring: () => handleUpdateApBssColoring(form?.getFieldsValue()),
      discardBssColoringChanges: () => handleDiscard()
    })
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingBssColoring || isResetBssColoring
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
              {$t({ defaultMessage: 'Enable BSS Coloring' })}
              <Form.Item
                name='ledEnabled'
                valuePropName='checked'
                style={{ marginTop: '-5px' }}
                children={isUseVenueSettings
                  ?<span data-testid='ApBssColoring-text'>
                    {venueBssColoring?.ledEnabled ? $t({ defaultMessage: 'On' })
                      : $t({ defaultMessage: 'Off' })}</span>
                  :<Switch data-testid='ApBssColoring-switch'/>
                }
              />
            </FieldLabel>
          </Col>
        </Row>

      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>
  )
  */
}
