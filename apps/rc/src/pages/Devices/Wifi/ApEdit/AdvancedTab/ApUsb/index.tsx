import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Space, Switch } from 'antd'
import { isEmpty }                       from 'lodash'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance, Tooltip } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                from '@acx-ui/icons'
import {
  useGetApUsbQuery,
  useLazyGetVenueApUsbStatusQuery,
  useUpdateApUsbMutation
} from '@acx-ui/rc/services'
import { ApUsbSettings, usbTooltipInfo, VenueApUsbStatus } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { FieldLabel }                                    from '../../styledComponents'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


export function ApUsb (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { isAllowEdit=true } = props


  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)

  const { apData: apDetails, venueData } = useContext(ApDataContext)
  const venueId = venueData?.id

  const formRef = useRef<StepsFormLegacyInstance<ApUsbSettings>>()

  const getApUsb = useGetApUsbQuery({ params: { venueId, serialNumber } })

  const [updateApUsb, { isLoading: isUpdatingApUsb }] = useUpdateApUsbMutation()

  const [getVenueUsb] = useLazyGetVenueApUsbStatusQuery()

  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [initData, setInitData] = useState({} as ApUsbSettings)
  const [apUsb, setApUsb] = useState({} as ApUsbSettings)
  const [venueUsb, setVenueUsb] = useState({} as VenueApUsbStatus)
  const [formInitializing, setFormInitializing] = useState(true)

  useEffect(() => {
    const apUsbData = getApUsb?.data
    if (apDetails && apUsbData) {
      const setData = async () => {
        const venueUsb = await getVenueUsb({ params: { venueId } }, true).unwrap()

        setVenueUsb(venueUsb?.find(apModel => apModel.model === apDetails?.model)
            || { usbPortEnable: false } as VenueApUsbStatus)
        setIsUseVenueSettings(apUsbData.useVenueSettings)
        isUseVenueSettingsRef.current = apUsbData.useVenueSettings

        setInitData(apUsbData)
        setFormInitializing(false)
      }

      setData()
    }
  }, [ apDetails, getApUsb?.data ])

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApUsb({ ...currentData } )
      }

      if (venueUsb) {
        const data = {
          ...venueUsb,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apUsb)) {
        formRef?.current?.setFieldsValue(apUsb)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const handleUpdateApUsb = async (values: ApUsbSettings) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      const payload = {
        ...values,
        useVenueSettings: isUseVenueSettingsRef.current
      }

      await updateApUsb(
        { params: { venueId, serialNumber }, payload }
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
      updateApUsb: () => handleUpdateApUsb(form?.getFieldsValue()),
      discardApUsbChanges: () => handleDiscard()
    })
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }


  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApUsb
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
              <Space>
                {$t({ defaultMessage: 'USB Support' })}
                <Tooltip title={$t(usbTooltipInfo, { br: <br/> })} placement='bottom'>
                  <QuestionMarkCircleOutlined style={{
                    height: '14px',
                    marginBottom: -3,
                    marginLeft: -8
                  }}/>
                </Tooltip>
              </Space>
              <Form.Item
                name='usbPortEnable'
                valuePropName='checked'
                style={{ marginTop: '-5px' }}
                children={isUseVenueSettings
                  ?<span data-testid='ApUsb-text'>
                    {venueUsb?.usbPortEnable ? $t({ defaultMessage: 'On' })
                      : $t({ defaultMessage: 'Off' })}</span>
                  :<Switch data-testid='ApUsb-switch' disabled={!isAllowEdit} />
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