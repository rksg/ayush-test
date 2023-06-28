import { Col, Row } from 'antd'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

import { SummaryCard }   from '..'
import { ProgressBarV2 } from '../../ProgressBar'
import { Tooltip }       from '../../Tooltip'

const data = [
  {
    title: 'title1',
    content: 'content1'
  },
  {
    title: 'title2',
    content: <a href='#1'>content2</a>
  },
  {
    title: 'title3',
    content: <Row><Col span={12}><ProgressBarV2 percent={100} /></Col></Row>
  },
  {
    title: <>
      <span style={{ display: 'inline-block',verticalAlign: 'top' }}>title3</span>
      <Tooltip
        title='tooltip3'
        placement='bottom'
      >
        <QuestionMarkCircleOutlined style={{ height: 15 }} />
      </Tooltip>
    </>,
    content: 'content4'
  },
  {
    title: 'title5',
    content: 'content5'
  }
]

export const BasicSummaryCard = () => (<SummaryCard data={data} />)