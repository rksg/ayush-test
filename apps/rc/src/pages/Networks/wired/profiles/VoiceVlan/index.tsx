import { useContext, useState, useEffect, Key } from 'react'

import { Row, Col, Form, Space } from 'antd'
import _                         from 'lodash'

import { StepsFormLegacy, Button } from '@acx-ui/components'
import {
  Vlan,
  VoiceVlanConfig,
  VoiceVlanOption
} from '@acx-ui/rc/utils'
import { getIntl }       from '@acx-ui/utils'
import { noDataDisplay } from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import * as UI             from './styledComponents'
import { VoiceVlanDrawer } from './VoiceVlanDrawer'

export function VoiceVlan () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ voiceVlanOptions, setVoiceVlanOptions ] = useState<VoiceVlanOption[]>([])
  const [ voiceVlanConfigs, setVoiceVlanConfigs ] = useState<VoiceVlanConfig[]>([])
  const [ drawerModelData, setDrawerModelData ] = useState<VoiceVlanOption>()
  const [ voiceVlanDrawerVisible, setVoiceVlanDrawerVisible ] = useState(false)

  useEffect(() => {
    if(currentData.voiceVlanOptions){
      setVoiceVlanOptions(currentData.voiceVlanOptions)
    }
    if(currentData.voiceVlanConfigs){
      setVoiceVlanConfigs(currentData.voiceVlanConfigs)
    }
  }, [currentData])

  const handleSetDefaultVlan = (data: Vlan) => {
    // const vlans = form.getFieldValue('vlans') || []
    // form.setFieldValue('vlans',
    //   [...vlans.filter((item: { vlanName: string }) => item.vlanName !== 'DEFAULT-VLAN'), data])
    // setDefaultVlan(data)
    // return true
  }

  const generateVoiceVlanDisplay = (config: VoiceVlanConfig) => {
    if(config.voiceVlans.length){
     return <>
     {
       config.voiceVlans.map(vlan => <div>
         {$t( { defaultMessage: 'VLAN-ID: {id}' }, { id: vlan.vlanId })}
         <span style={{paddingLeft: '5px'}}>({vlan.taggedPorts.join(', ')})</span>
         </div>)
     }
     </>
    }
    return noDataDisplay
  }

  const onSetVoiceVlan = (config: VoiceVlanConfig) => {
    setDrawerModelData(voiceVlanOptions.find(option => option.model == config.model))
    setVoiceVlanDrawerVisible(true)
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'Voice VLAN' })} />
          {
            voiceVlanConfigs.map((item:any) => <div key={item.model}>
              <StepsFormLegacy.SectionTitle style={{ width: '800px', margin: '25px 0 12px 0' }}>
                {item.model}
              </StepsFormLegacy.SectionTitle>
              <Space style={{
                width: '800px', display: 'flex', justifyContent: 'space-between'
              }}>
                <UI.FormLabel>
                  <Form.Item
                    label={$t({ defaultMessage: 'Voice VLAN' })}
                  />
                </UI.FormLabel>
                <Button type='link'
                  size='small'
                  onClick={()=>{ onSetVoiceVlan(item) }}
                >
                  {$t({ defaultMessage: 'Set Voice VLAN' })}
                </Button>
              </Space>
              <UI.FormChildren>
                <Form.Item
                  children={<>{ generateVoiceVlanDisplay(item) }</>}
                />
              </UI.FormChildren>
            </div>)
          }

        </Col>
      </Row>
      <VoiceVlanDrawer
        visible={voiceVlanDrawerVisible}
        setVisible={setVoiceVlanDrawerVisible}
        modelData={drawerModelData}
      />
    </>
  )
}
