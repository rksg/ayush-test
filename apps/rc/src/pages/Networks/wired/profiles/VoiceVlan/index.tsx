import { useContext, useState, useEffect, Key } from 'react'

import { Row, Col, Form, Input, Space } from 'antd'
import _                         from 'lodash'

import { showActionModal, Table, TableProps, StepsFormLegacy, Tooltip, Button } from '@acx-ui/components'
import { VlanSettingDrawer }                                            from '@acx-ui/rc/components'
import {
  Vlan,
  VoiceVlanOption
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { VoiceVlanDrawer } from './VoiceVlanDrawer'
import { noDataDisplay }                           from '@acx-ui/utils'
import * as UI               from './styledComponents'

export function VoiceVlan () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ vlanTable, setVlanTable ] = useState<Vlan[]>([])
  const [ voiceVlanOptions, setVoiceVlanOptions ] = useState<any>([])
  const [ drawerModelData, setDrawerModelData ] = useState<VoiceVlanOption>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ vlanDrawerVisible, setVlanDrawerVisible ] = useState(false)
  const [ voiceVlanDrawerVisible, setVoiceVlanDrawerVisible ] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  useEffect(() => {
    if(currentData.voiceVlanOptions){
      setVoiceVlanOptions(currentData.voiceVlanOptions)
    }
  }, [currentData])

  const handleSetDefaultVlan = (data: Vlan) => {
    // const vlans = form.getFieldValue('vlans') || []
    // form.setFieldValue('vlans',
    //   [...vlans.filter((item: { vlanName: string }) => item.vlanName !== 'DEFAULT-VLAN'), data])
    // setDefaultVlan(data)
    // return true
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
        <StepsFormLegacy.Title children={$t({ defaultMessage: 'Voice VLAN' })} />
        {
          voiceVlanOptions.map((item:any) => <div key={item.model}>
            <StepsFormLegacy.SectionTitle style={{width: '800px', marginBottom: '15px'}}>
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
                onClick={()=>{ 
                  setVoiceVlanDrawerVisible(true)
                  setDrawerModelData(item)
                }}
              >
                {$t({ defaultMessage: 'Set Voice VLAN' })}
              </Button>
            </Space>
            <Form.Item
              children={<span>{noDataDisplay}</span>}
            />
          </div>)
        }
       
        </Col>
      </Row>
      <VoiceVlanDrawer
        visible={voiceVlanDrawerVisible}
        setVisible={setVoiceVlanDrawerVisible}
        modelData={drawerModelData}
        setDefaultVlan={handleSetDefaultVlan}
        vlansList={vlanTable}
      />
    </>
  )
}
