import { Collapse } from 'antd'
import { useIntl }  from 'react-intl'


import { ClientTroubleShootingConfig } from './config'
import * as UI                         from './styledComponents'

const { Panel } = Collapse

export function TimeLine (){
  const { $t } = useIntl()
  return (
    <Collapse
      bordered={false}
      expandIcon={({ isActive }) =>
        isActive ? (
          <UI.StyledMinusSquareOutlined />
        ) : (
          <UI.StyledPlusSquareOutlined />
        )
      }
      ghost>
      {ClientTroubleShootingConfig.timeLine.map((config, index) => (
        <Panel header={<UI.TimelineTitle>{$t(config.title)}</UI.TimelineTitle>} key={index}>
          <UI.TimelineTitle>{$t(config.title)}</UI.TimelineTitle>
        </Panel>
      ))}
    </Collapse>
  )
}