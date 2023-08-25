import { useContext, useState, useEffect, Key } from 'react'

import { Row, Col, Form, Input, Space } from 'antd'
import _                         from 'lodash'

import { showActionModal, Table, TableProps, StepsFormLegacy, Tooltip, Button } from '@acx-ui/components'
import { VlanSettingDrawer }                                            from '@acx-ui/rc/components'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { DefaultVlanDrawer } from './DefaultVlanDrawer'
import * as UI               from './styledComponents'

export function VoiceVlan () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ vlanTable, setVlanTable ] = useState<Vlan[]>([])
  const [ voiceVlanOptions, setVoiceVlanOptions ] = useState<any>([])
  const [ drawerFormRule, setDrawerFormRule ] = useState<Vlan>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ vlanDrawerVisible, setVlanDrawerVisible ] = useState(false)
  const [ defaultVlanDrawerVisible, setDefaultVlanDrawerVisible ] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  useEffect(() => {
    if(currentData.voiceVlanOptions){
      setVoiceVlanOptions(currentData.voiceVlanOptions)
    }
  }, [currentData, editMode])

  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
        <StepsFormLegacy.Title children={$t({ defaultMessage: 'Voice VLAN' })} />
        {
          voiceVlanOptions.map((item:any) => <>
            <StepsFormLegacy.SectionTitle style={{width: '800px', marginBottom: '15px'}}>
              {item?.model}
            </StepsFormLegacy.SectionTitle>
            <Space style={{
              width: '800px', display: 'flex', justifyContent: 'space-between'
            }}>
              <Form.Item
                label={$t({ defaultMessage: 'Voice VLAN' })}
                children={<></>}
              />
              <Button type='link'
                  size='small'
                  onClick={()=>{}}
              >
                {$t({ defaultMessage: 'Set Voice VLAN' })}
              </Button>
            </Space>
           
          </>)
        }
       
        </Col>
      </Row>
    </>
  )
}
