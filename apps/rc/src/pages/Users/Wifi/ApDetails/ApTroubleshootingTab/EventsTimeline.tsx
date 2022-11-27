import { Collapse } from 'antd'

import {  PlusSquareOutlined, MinusSquareOutlined } from '@acx-ui/icons'

import { ClientTroubleShootingConfig } from './config'

const { Panel } = Collapse

export function TimeLine (){
  return (
    <Collapse
      bordered={false}
      expandIcon={({ isActive }) =>
        isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />
      }
      ghost>
      {ClientTroubleShootingConfig.timeLine.map((config,index)=>
        <Panel
          header={config.title}
          key={index}>
          <p>{config.title}</p>
        </Panel>)}
    </Collapse>
  )
}