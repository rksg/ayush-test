import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Switch } from 'antd'
import { useIntl }                                      from 'react-intl'

import { Loader, StepsForm, StepsFormInstance, Tabs, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                          from '@acx-ui/icons'
import {
  // useLazyApListQuery,
  // useGetVenueCapabilitiesQuery,
  useGetDefaultRadioCustomizationQuery,
  useGetVenueRadioCustomizationQuery,
  useUpdateVenueRadioCustomizationMutation,
  useGetVenueTripleBandRadioSettingsQuery,
  useUpdateVenueTripleBandRadioSettingsMutation
} from '@acx-ui/rc/services'
import {
  VenueDefaultRegulatoryChannelsForm
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../..'

import { Radio24GHz }     from './Radio24GHz'
import { Radio5GHz }      from './Radio5GHz'
import { Radio6GHz }      from './Radio6GHz'
import { RadioLower5GHz } from './RadioLower5GHz'
import { RadioUpper5GHz } from './RadioUpper5GHz'

export function RadioSettings () {
  const { $t } = useIntl()

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)

  const { tenantId, venueId } = useParams()

  const formRef = useRef<StepsFormInstance<VenueDefaultRegulatoryChannelsForm>>()
  const [triBandRadio, setTriBandRadio] = useState(false)
  const [radioBandManagement, setRadioBandManagement] = useState(true)
  // const [triBandApModels, setTriBandApModels] = useState<string[]>([])

  // const { data: venueCaps } = useGetVenueCapabilitiesQuery({ params: { tenantId, venueId } })

  const { data: tripleBandRadioSettingsData } =
    useGetVenueTripleBandRadioSettingsQuery({ params: { tenantId, venueId } })

  const { data: defaultChannelsData } =
    useGetDefaultRadioCustomizationQuery({ params: { tenantId, venueId } })

  const { data: venueSavedChannelsData, isLoading: isLoadingVenueData } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } })

  const [ updateVenueRadioCustomization, { isLoading: isUpdatingVenueRadio } ] =
    useUpdateVenueRadioCustomizationMutation()

  const [ updateVenueTripleBandRadioSettings ] = useUpdateVenueTripleBandRadioSettingsMutation()

  // const [apList] = useLazyApListQuery()

  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)

  // const triBandApModelNames = _.isEmpty(triBandApModels)? ['R760', 'R560'] : triBandApModels
  // let filters = { model: triBandApModelNames }

  // if (venueId?.length) {
  //   filters = Object.assign(filters, { venueId })
  // }
  // const payload = {
  //   fields: ['name', 'model', 'venueId', 'id'],
  //   pageSize: 10000,
  //   sortField: 'name',
  //   sortOrder: 'ASC',
  //   url: '/api/viewmodel/{tenantId}/aps',
  //   filters
  // }

  useEffect(() => {
    // TODO
    // if(venueCaps){
    //   setTriBandApModels(venueCaps?.apModels
    //     .filter(apCapability => apCapability.supportTriRadio === true)
    //     .map(triBandApCapability => triBandApCapability.model) as string[])
    // }

    if(tripleBandRadioSettingsData){
      setTriBandRadio(tripleBandRadioSettingsData.enabled)
      // TODO
      // try{
      //   const apListData = apList({ params: { tenantId }, payload })
      //   if(apListData){
      //     apListData.unwrap().then((data)=>{
      //       const hasTriBandAp = data.some((ap: AP) => ap.venueId === venueId)
      //       setTriBandRadio(hasTriBandAp)
      //     })
      //   }
      // }catch(e){ return e }
    }

    if(venueSavedChannelsData){
      setEditRadioContextData({ radioData: venueSavedChannelsData })
      formRef?.current?.setFieldsValue(venueSavedChannelsData)
      setRadioBandManagement(formRef?.current?.getFieldValue(['radioParamsDual5G', 'enabled']))
      setEditRadioContextData({
        ...editRadioContextData,
        radioData: formRef.current?.getFieldsValue(),
        updateWifiRadio: handleUpdateRadioSettings
      })
    }else if(defaultChannelsData){
      setEditRadioContextData({ radioData: defaultChannelsData })
      formRef?.current?.setFieldsValue(defaultChannelsData)
      setRadioBandManagement(formRef?.current?.getFieldValue(['radioParamsDual5G', 'enabled']))
      setEditRadioContextData({
        ...editRadioContextData,
        radioData: formRef.current?.getFieldsValue(),
        updateWifiRadio: handleUpdateRadioSettings
      })
    }
  }, [tripleBandRadioSettingsData,
    defaultChannelsData, venueSavedChannelsData,
    triBandRadioFeatureFlag, setEditRadioContextData])

  const [currentTab, setCurrentTab] = useState('Normal24GHz')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const onRadioChange = (e: RadioChangeEvent) => {
    setRadioBandManagement(e.target.value)
    if(e.target.value){
      formRef.current?.setFieldValue(['radioParamsDual5G', 'enabled'], true)
    }
    onTabChange('Normal24GHz')
  }

  const handleUpdateRadioSettings =
  async (formData: VenueDefaultRegulatoryChannelsForm) => {
    formData.radioParams50G.allowedIndoorChannels =
      formRef.current?.getFieldValue(['radioParams50G', 'allowedIndoorChannels'])
    formData.radioParams50G.allowedOutdoorChannels =
      formRef.current?.getFieldValue(['radioParams50G', 'allowedOutdoorChannels'])
    if(formData.radioParamsDual5G){
      updateVenueTripleBandRadioSettings({
        params: { tenantId, venueId },
        payload: { enabled: formData.radioParamsDual5G.enabled }
      })
      formData.radioParamsDual5G.radioParamsLower5G.allowedIndoorChannels =
        formRef.current?.getFieldValue(['radioParamsDual5G', 'radioParamsLower5G',
          'allowedIndoorChannels'])
      formData.radioParamsDual5G.radioParamsLower5G.allowedOutdoorChannels =
        formRef.current?.getFieldValue(['radioParamsDual5G', 'radioParamsLower5G',
          'allowedOutdoorChannels'])
      formData.radioParamsDual5G.radioParamsUpper5G.allowedIndoorChannels =
        formRef.current?.getFieldValue(['radioParamsDual5G', 'radioParamsUpper5G',
          'allowedIndoorChannels'])
      formData.radioParamsDual5G.radioParamsUpper5G.allowedOutdoorChannels =
        formRef.current?.getFieldValue(['radioParamsDual5G', 'radioParamsUpper5G',
          'allowedOutdoorChannels'])
    }

    updateVenueRadioCustomization({
      params: { tenantId, venueId },
      payload: formData
    })
  }

  const handleChange = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
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
      >
        <StepsForm.StepForm data-testid='radio-settings'>
          {triBandRadioFeatureFlag &&
            <StepsForm.FieldLabel width='max-content'>
              {$t({ defaultMessage: 'Tri-band radio settings' })}
              <Space>
                <Switch
                  checked={triBandRadio}
                  onClick={(checked, event) => {
                    event.stopPropagation()
                    setTriBandRadio(checked)
                    setEditContextData({
                      ...editContextData,
                      unsavedTabKey: 'radio',
                      isDirty: true
                    })
                    onTabChange('Normal24GHz')
                  }}
                  style={{ marginLeft: '20px' }}
                />
                <Tooltip
                // eslint-disable-next-line max-len
                  title={$t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R760 and R560' })}
                  placement='bottom'
                >
                  <QuestionMarkCircleOutlined />
                </Tooltip>
              </Space>
            </StepsForm.FieldLabel>
          }
          {triBandRadioFeatureFlag && triBandRadio &&
          <Form.Item
            name={['radioParamsDual5G', 'enabled']}
            label='R760 radio bands management'
            style={{ marginTop: '16px' }}
            initialValue={true}
          >
            <Radio.Group onChange={onRadioChange}>
              <Radio value={true}>
                {$t({ defaultMessage: 'Split 5GHz into lower and upper bands' })}
              </Radio>

              <Radio value={false}>
                {$t({ defaultMessage: 'Use 5 and 6 Ghz bands' })}
              </Radio>
            </Radio.Group>
          </Form.Item>
          }
          <Tabs onChange={onTabChange}
            activeKey={currentTab}
            type='third'
            style={{ marginTop: triBandRadioFeatureFlag ? '5em' : '' }}>
            <Tabs.TabPane tab={$t({ defaultMessage: '2.4 GHz' })} key='Normal24GHz' />
            <Tabs.TabPane tab={$t({ defaultMessage: '5 GHz' })} key='Normal5GHz' />
            { triBandRadio && radioBandManagement &&
                  <>
                    <Tabs.TabPane
                      tab={$t({ defaultMessage: 'Lower 5 GHz' })}
                      key='Lower5GHz' />
                    <Tabs.TabPane
                      tab={$t({ defaultMessage: 'Upper 5 GHz' })}
                      key='Upper5GHz' />
                  </>
            }
            { triBandRadio &&
                <Tabs.TabPane tab={$t({ defaultMessage: '6 GHz' })} key='Normal6GHz' />
            }
          </Tabs>
          <div style={{ display: currentTab === 'Normal24GHz' ? 'block' : 'none' }}>
            <Radio24GHz />
          </div>
          <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
            <Radio5GHz />
          </div>
          { triBandRadio &&<div style={{ display: triBandRadio &&
                currentTab === 'Normal6GHz' ? 'block' : 'none' }}>
            <Radio6GHz />
          </div>
          }
          { triBandRadio && radioBandManagement &&
            <>
              <div style={{
                display: triBandRadio && radioBandManagement &&
                  currentTab === 'Lower5GHz' ? 'block' : 'none'
              }}>
                <RadioLower5GHz />
              </div><div style={{
                display: triBandRadio && radioBandManagement &&
                  currentTab === 'Upper5GHz' ? 'block' : 'none'
              }}>
                <RadioUpper5GHz />
              </div>
            </>
          }
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}
