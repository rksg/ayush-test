import { storiesOf }     from '@storybook/react'
import { Space }         from 'antd'
import { BrowserRouter } from 'react-router-dom'

import { Layout } from '..'
import { Card }   from '../../Card'

import menuConfig from './menuConfig'

storiesOf('Layout', module).add('Basic', () => (
  // fix for storybook only
  <div style={{ margin: '-16px' }}>
    <BrowserRouter>
      <Layout
        menuConfig={menuConfig}
        rightHeaderContent={
          <div style={{ color: 'var(--acx-primary-white)' }}>
            Right header.
          </div>
        }
        leftHeaderContent={
          <div style={{ color: 'var(--acx-primary-white)' }}>
            Left header.
          </div>
        }
        content={
          <Space direction='vertical' style={{ width: '100%' }}>
            <Card>Full width content.</Card>
            <div>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
              <p>More content.</p>
            </div>
          </Space>
        }
      />
    </BrowserRouter>
  </div>
))
