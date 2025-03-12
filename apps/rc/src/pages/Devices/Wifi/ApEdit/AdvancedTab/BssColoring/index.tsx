import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { isEmpty }                from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance }                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                    from '@acx-ui/feature-toggle'
import { useGetApBssColoringQuery, useLazyGetVenueBssColoringQuery, useUpdateApBssColoringMutation } from '@acx-ui/rc/services'
import { ApBssColoringSettings, VenueBssColoring }                                                   from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { FieldLabel }                                    from '../../styledComponents'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


export function BssColoring (props: ApEditItemProps) {

  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { isAllowEdit=true } = props

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)


  const { venueData } = useContext(ApDataContext)
  const venueId = venueData?.id

  const formRef = useRef<StepsFormLegacyInstance<ApBssColoringSettings>>()

  const getApBssColoring = useGetApBssColoringQuery({
    params: { venueId, serialNumber }, enableRbac: isUseRbacApi
  }, { skip: !venueId })

  const [updateApBssColoring, { isLoading: isUpdatingBssColoring }]
    = useUpdateApBssColoringMutation()

  const [getVenueBssColoring] = useLazyGetVenueBssColoringQuery()

  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [initData, setInitData] = useState({} as ApBssColoringSettings)
  const [apBssColoring, setApBssColoring] = useState({})
  const [venueBssColoring, setVenueBssColoring] = useState({} as VenueBssColoring)
  const [formInitializing, setFormInitializing] = useState(true)

  useEffect(() => {
    const apBssColoringData = getApBssColoring?.data
    if (apBssColoringData && venueId) {
      const setData = async () => {
        const venueBssColoringData = (await getVenueBssColoring({
          params: { venueId },
          enableRbac: isUseRbacApi
        }).unwrap())

        // setVenue(apVenue)
        setVenueBssColoring(venueBssColoringData)
        setIsUseVenueSettings(apBssColoringData.useVenueSettings)
        isUseVenueSettingsRef.current = apBssColoringData.useVenueSettings

        setInitData(apBssColoringData)
        setFormInitializing(false)
      }

      setData()
    }
  }, [ venueId, getApBssColoring?.data, getVenueBssColoring ])

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

      const payload: ApBssColoringSettings = {
        ...values,
        useVenueSettings: isUseVenue
      }
      await updateApBssColoring(
        { params: { venueId, serialNumber }, payload, enableRbac: isUseRbacApi }
      ).unwrap()

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
    isFetching: isUpdatingBssColoring
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={handleChange}
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        <VenueSettingsHeader venue={venueData}
          disabled={!isAllowEdit}
          isUseVenueSettings={isUseVenueSettings}
          handleVenueSetting={handleVenueSetting} />
        <Row gutter={0} style={{ height: '40px' }}>
          <Col span={8}>
            <FieldLabel width='180px' >
              {$t({ defaultMessage: 'Enable BSS Coloring' })}
              <Form.Item
                name='bssColoringEnabled'
                valuePropName='checked'
                style={{ marginTop: '-5px' }}
                children={isUseVenueSettings
                  ?<span data-testid='ApBssColoring-text'>
                    {venueBssColoring?.bssColoringEnabled ? $t({ defaultMessage: 'On' })
                      : $t({ defaultMessage: 'Off' })}</span>
                  :<Switch data-testid='ApBssColoring-switch' disabled={!isAllowEdit} />
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
