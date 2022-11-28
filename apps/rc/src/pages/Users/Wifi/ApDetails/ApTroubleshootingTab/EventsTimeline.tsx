import { Collapse } from 'antd'
import { useIntl }  from 'react-intl'

import {  PlusSquareOutlined, MinusSquareOutlined } from '@acx-ui/icons'

import { ClientTroubleShootingConfig } from './config'

const { Panel } = Collapse

export function TimeLine (){
  const { $t } = useIntl()
  return (
    <Collapse
      bordered={false}
      expandIcon={({ isActive }) =>
        isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />
      }
      ghost
    >
      {ClientTroubleShootingConfig.timeLine.map((config,index)=>
        <Panel
          header={$t(config.title)}
          key={index}>
          <p>{$t(config.title)}</p>
        </Panel>)}
    </Collapse>
  )
}