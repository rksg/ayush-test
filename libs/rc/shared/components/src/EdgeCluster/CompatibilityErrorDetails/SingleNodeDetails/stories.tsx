import { storiesOf }  from '@storybook/react'
import { Typography } from 'antd'

import { SingleNodeDetails } from '.'

const getFields = () => {
  return [{
    key: 'lags',
    title: 'Number of LAGs',
    render: () => <Typography.Text type='danger' children={1}/>
  }, {
    key: 'corePorts',
    title: 'Number of Core Ports',
    render: () => <Typography.Text children={0}/>
  }, {
    key: 'portType',
    title: 'Port Types',
    render: () => {
      return [{
        label: 'WAN',
        isError: false
      }, {
        label: 'LAN',
        isError: true
      }].map((item, idx) => <Typography.Text
        key={item.label}
        type={item.isError?'danger':undefined}
        children={`${item.label}${idx!==1?', ':''}`}
      />)
    }
  }]
}

storiesOf('CompatibilityErrorDetails > SingleNodeDetails', module)

  .add('Basic', () => {
    const fields = getFields()
    return <SingleNodeDetails
      title='SE_Node1'
      fields={fields}
    />
  })