import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row }            from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Loader, StepsForm, StepsFormInstance, Tabs } from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import {
  useGetApQuery,
  useGetVenueQuery,
  useGetApRadioQuery,
  useUpdateApRadioMutation
} from '@acx-ui/rc/services'
import {
  ApRadioChannelsForm
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { ApEditContext } from '../..'

import { Radio24GHz } from './Radio24GHz'
import { Radio5GHz }  from './Radio5GHz'

export function RadioSettings () {
  const { $t } = useIntl()

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { tenantId, serialNumber } = useParams()
  const { data } = useGetApQuery({ params: { tenantId, serialNumber } })

  const formRef = useRef<StepsFormInstance<ApRadioChannelsForm>>()
  const [venueSetting, setVenueSetting] = useState(false)
  const [venueId, setVenueId] = useState('')

  const { data: venueSavedChannelsData, isLoading: isLoadingVenueData } =
    useGetApRadioQuery({ params: { tenantId, serialNumber } })

  const [ updateApRadio, { isLoading: isUpdatingVenueRadio } ] =
    useUpdateApRadioMutation()

  const { data: venue } = useGetVenueQuery({ params: { tenantId, venueId } })

  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  useEffect(() => {
    // TODO
    // if(venueCaps){
    //   setTriBandApModels(venueCaps?.apModels
    //     .filter(apCapability => apCapability.supportTriRadio === true)
    //     .map(triBandApCapability => triBandApCapability.model) as string[])
    // }

    if(data){
      setVenueId(data.venueId)
    }

    if(venueSavedChannelsData){
      setEditRadioContextData({ radioData: venueSavedChannelsData })
      formRef?.current?.setFieldsValue(venueSavedChannelsData)
      setVenueSetting(venueSavedChannelsData.useVenueSettings)
      setEditRadioContextData({
        ...editRadioContextData,
        radioData: formRef.current?.getFieldsValue(),
        updateWifiRadio: handleUpdateRadioSettings
      })
    }
  }, [venueSavedChannelsData, triBandRadioFeatureFlag, data])

  const [currentTab, setCurrentTab] = useState('Normal24GHz')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const handleUpdateRadioSettings =
  async (formData: ApRadioChannelsForm) => {
    updateApRadio({
      params: { tenantId, serialNumber },
      payload: formData
    })
  }

  const handleVenueSetting = () => {
    formRef.current?.setFieldValue('useVenueSettings', !venueSetting)
    setVenueSetting(!venueSetting)
  }

  const handleChange = () => {
    setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
    setEditRadioContextData({
      ...editRadioContextData,
      radioData: formRef.current?.getFieldsValue(),
      updateWifiRadio: handleUpdateRadioSettings
    })
  }
  return (
    <Loader states={[{ isLoading: isLoadingVenueData, isFetching: isUpdatingVenueRadio }]}>
      <StepsForm
        formRef={formRef}
        onFormChange={handleChange}
        onFinish={handleUpdateRadioSettings}
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply Radio' })
        }}
      >
        <StepsForm.StepForm data-testid='radio-settings'>
          <Row gutter={20}>
            <Col span={12}>
              { venueSetting ?
                <FormattedMessage
                // eslint-disable-next-line max-len
                  defaultMessage={`<p>
                  Currently using radio settings of the venue (<venuelink></venuelink>)
                </p>`}
                  values={{
                    venuelink: () =>
                      <TenantLink
                        to={`venues/${venueId}/venue-details/overview`}>{venue?.name}
                      </TenantLink>,
                    p: (contents) => <p>{contents}</p>
                  }}
                />
                :
                <span>{$t({ defaultMessage: 'Custom radio settings' })}</span>
              }
            </Col>
            <Col span={8}>
              <Button type='link' onClick={handleVenueSetting}>
                {venueSetting ?
                  $t({ defaultMessage: 'Customize' }):$t({ defaultMessage: 'Use Venue Settings' })
                }
              </Button>
            </Col>
          </Row>
          <Tabs onChange={onTabChange}
            activeKey={currentTab}
            type='third'>
            <Tabs.TabPane tab={$t({ defaultMessage: '2.4 GHz' })} key='Normal24GHz' />
            <Tabs.TabPane tab={$t({ defaultMessage: '5 GHz' })} key='Normal5GHz' />
          </Tabs>
          <div style={{ display: currentTab === 'Normal24GHz' ? 'block' : 'none' }}>
            <Radio24GHz venueId={venueId} serialNumber={serialNumber as string} />
          </div>
          <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
            <Radio5GHz venueId={venueId} serialNumber={serialNumber as string} />
          </div>
          <Form.Item name='apRadioParams6G' initialValue={null}/>
          <Form.Item name='apRadioParamsDual5G' initialValue={null}/>
          <Form.Item name='enable6G' initialValue={false}/>
          <Form.Item name='useVenueSettings' initialValue={false}/>
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}
