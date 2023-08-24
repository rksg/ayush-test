import { useContext, useState, useEffect, Key } from 'react'

import { Row, Col, Form, Input } from 'antd'
import _                         from 'lodash'

import { showActionModal, Table, TableProps, StepsFormLegacy, Tooltip } from '@acx-ui/components'
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
  const [ defaultVlan, setDefaultVlan ] = useState<Vlan>()
  const [ drawerFormRule, setDrawerFormRule ] = useState<Vlan>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ vlanDrawerVisible, setVlanDrawerVisible ] = useState(false)
  const [ defaultVlanDrawerVisible, setDefaultVlanDrawerVisible ] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  useEffect(() => {
    if(currentData.vlans){
      form.setFieldsValue(currentData)

      const defaultVlanData = currentData.vlans.filter(
        item => item.vlanName === 'DEFAULT-VLAN' )[0] || {}
      setDefaultVlan(defaultVlanData)

      const vlanList = currentData.vlans.filter(item => item.vlanName !== 'DEFAULT-VLAN' )
      setVlanTable(vlanList)
    }
  }, [currentData, editMode])

  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
        <StepsFormLegacy.Title children={$t({ defaultMessage: 'Voice VLAN' })} />
        <StepsFormLegacy.SectionTitle id='aaa-servers'>
          test
        </StepsFormLegacy.SectionTitle>
        <Form.Item
          label={$t({ defaultMessage: 'Voice VLAN' })}
        />
        </Col>
      </Row>
    </>
  )
}
