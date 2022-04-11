import { storiesOf }     from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import menuConfig        from 'src/App/Layout/menuConfig'
import Layout            from '.'

storiesOf('Layout', module).add('Basic', () => (
  // fix for storybook only
  <div style={{ margin: '-16px' }}>
    <BrowserRouter>
      <Layout
        initPath={'/'}
        menuConfig={menuConfig}
        rightHeaderContent={
          <div style={{ color: 'var(--acx-primary-white)' }}>
            This is right header.
          </div>
        }
        leftHeaderContent={
          <div style={{ color: 'var(--acx-primary-white)' }}>
            This is left header.
          </div>
        }
        content={
          <div>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
            <p>This is content.</p>
          </div>
        }
      />
    </BrowserRouter>
  </div>
))
