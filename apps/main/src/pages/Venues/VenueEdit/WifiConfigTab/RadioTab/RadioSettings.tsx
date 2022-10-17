import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Switch, Tabs, Tooltip } from 'antd'
import _                                                               from 'lodash'
import { useIntl }                                                     from 'react-intl'

import { Loader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { Features, useSplitTreatment }                     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                      from '@acx-ui/icons'
import {
  useApListQuery,
  useGetVenueCapabilitiesQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import {
  VenueDefaultRegulatoryChannelsForm
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../..'

import { Radio24GHz }     from './Radio24GHz'
import { Radio5GHz }      from './Radio5GHz'
import { Radio6GHz }      from './Radio6GHz'
import { RadioLower5GHz } from './RadioLower5GHz'
import { RadioUpper5GHz } from './RadioUpper5GHz'
import { FieldLabel }     from './styledComponents'

const tabs = {
  Normal24GHz: Radio24GHz,
  Normal5GHz: Radio5GHz,
  Normal6GHz: Radio6GHz,
  Lower5GHz: RadioLower5GHz,
  Upper5GHz: RadioUpper5GHz
}

const { useWatch } = Form

export function RadioSettings () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId, venueId } = useParams()
  const basePath = useTenantLink('/venues/')
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const formRef = useRef<StepsFormInstance<VenueDefaultRegulatoryChannelsForm>>()
  const [triBandRadio, setTriBandRadio] = useState(false)
  const [radioBandManagement, setRadioBandManagement] = useState('5GHzLowerUpper')
  const [triBandApModels, setTriBandApModels] = useState<string[]>([])

  const { data: venueCaps } = useGetVenueCapabilitiesQuery({ params: { tenantId, venueId } })

  const triBandApModelNames = _.isEmpty(triBandApModels)? ['R760', 'R560'] : triBandApModels

  const defaultPayload = {
    fields: ['name', 'model', 'venueId', 'id'],
    filters: {
      model: triBandApModelNames,
      venueId: [venueId]
    },
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC',
    url: '/api/viewmodel/{tenantId}/aps'
  }

  const { data } = useApListQuery({ params: { tenantId }, payload: defaultPayload })

  useEffect(() => {
    if(venueCaps){
      setTriBandApModels(venueCaps?.apModels
        .filter(apCapability => apCapability.supportTriRadio === true)
        .map(triBandApCapability => triBandApCapability.model) as string[])
    }
  }, [venueCaps])

  // if (venueIds.length) {
  //   filters = Object.assign(filters, { venueId: venueIds });
  // }
  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)

  const handleUpdate = async () => {
    console.log(formRef.current?.getFieldsValue())
    return false
  }

  const [currentTab, setCurrentTab] = useState('Normal24GHz')
  const Tab = tabs[currentTab as keyof typeof tabs]

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const onRadioChange = (e: RadioChangeEvent) => {
    setRadioBandManagement(e.target.value)
  }
  return (
    <Loader>
      <StepsForm
        formRef={formRef}
        onFinish={handleUpdate}
        onCancel={() => {}}
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm
          layout='horizontal'
          labelAlign='left'
          onFinish={handleUpdate}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 12 }}
          initialValues={{}}
        >
          <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
            <FieldLabel width='200px'>
              {$t({ defaultMessage: 'Tri-band radio settings' })}
              <Form.Item
                name='triband'
                valuePropName='checked'
                initialValue={triBandRadio}
                children={
                  <>
                    <Switch
                      disabled={!triBandRadioFeatureFlag}
                      onClick={(checked, event) => {
                        setTriBandRadio(checked)
                        event.stopPropagation()
                      }} /><Tooltip
                      // eslint-disable-next-line max-len
                      title={$t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R760 and R560' })}
                      placement='bottom'
                    >
                      <QuestionMarkCircleOutlined />
                    </Tooltip>
                  </>
                }
              />
            </FieldLabel>
            {triBandRadio &&
              <>
                {$t({ defaultMessage: 'R760 radio bands management' })}
                <Radio.Group onChange={onRadioChange} defaultValue={'5GHzLowerUpper'}>
                  <Space direction='vertical'>
                    <FieldLabel width='300px'>
                      <Radio value={'5GHzLowerUpper'}>
                        {$t({ defaultMessage: 'Split 5GHz into lower and upper bands' })}
                      </Radio>
                    </FieldLabel>

                    <FieldLabel width='300px'>
                      <Radio value={'6GHz'}>
                        {$t({ defaultMessage: 'Use 5 and 6 Ghz bands' })}
                      </Radio>
                    </FieldLabel>
                  </Space>
                </Radio.Group>
              </>
            }
            <Tabs onChange={onTabChange} activeKey={currentTab}>
              <Tabs.TabPane tab={$t({ defaultMessage: '2.4GHz' })} key='Normal24GHz' />
              <Tabs.TabPane tab={$t({ defaultMessage: '5 GHz' })} key='Normal5GHz' />
              { triBandRadio && radioBandManagement === '5GHzLowerUpper' &&
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
                ( radioBandManagement === '5GHzLowerUpper' || radioBandManagement === '6GHz' ) &&
                <Tabs.TabPane tab={$t({ defaultMessage: '6 GHz' })} key='Normal6GHz' />
              }
            </Tabs>
            {Tab && <Tab /> }
          </Space>
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}