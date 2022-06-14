import '@testing-library/jest-dom'
import { render }                  from '@testing-library/react'
import { Space }                   from 'antd'
import { BrowserRouter as Router } from 'react-router-dom'

import { Card } from '../Card'

import menuConfig from './stories/menuConfig'

import { Layout } from '.'

describe('NetworkDetails', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Router>
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
              <div>content</div>
            </Space>
          }
        />
      </Router>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})