import { storiesOf } from '@storybook/react'
import { Space }     from 'antd'

import { DownloadOutlined } from '@acx-ui/icons'

import { ToggleButton } from '../ToggleButton'

import { Button } from '.'

storiesOf('Button', module)
  .add('Small', () => (
    <>
      <p>
        <Space>
          <Button size='small' type='primary'>Primary</Button>
          <Button size='small' type='secondary'>Secondary</Button>
          <Button size='small'>Default</Button>
          <Button size='small' icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='small' icon={<DownloadOutlined />} />
          <Button size='small' type='link'>Link</Button>
        </Space>
      </p>
      <p>
        <Space>
          <Button size='small' disabled type='primary'>Primary</Button>
          <Button size='small' disabled type='secondary'>Secondary</Button>
          <Button size='small' disabled>Default</Button>
          <Button size='small' disabled icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='small' disabled icon={<DownloadOutlined />} />
        </Space>
      </p>
    </>
  ))
  .add('Medium', () => (
    <>
      <p>
        <Space>
          <Button type='primary'>Primary</Button>
          <Button type='secondary'>Secondary</Button>
          <Button>Default</Button>
          <Button icon={<DownloadOutlined />}>With Icon</Button>
          <Button icon={<DownloadOutlined />} />
          <Button type='link'>Link</Button>
        </Space>
      </p>
      <p>
        <Space>
          <Button disabled type='primary'>Primary</Button>
          <Button disabled type='secondary'>Secondary</Button>
          <Button disabled>Default</Button>
          <Button disabled icon={<DownloadOutlined />}>With Icon</Button>
          <Button disabled icon={<DownloadOutlined />} />
        </Space>
      </p>
    </>
  ))
  .add('Large', () => (
    <>
      <p>
        <Space>
          <Button size='large' type='primary'>Primary</Button>
          <Button size='large' type='secondary'>Secondary</Button>
          <Button size='large'>Default</Button>
          <Button size='large' icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='large' icon={<DownloadOutlined />} />
          <Button size='large' type='link'>Link</Button>
        </Space>
      </p>
      <p>
        <Space>
          <Button size='large' disabled type='primary'>Primary</Button>
          <Button size='large' disabled type='secondary'>Secondary</Button>
          <Button size='large' disabled>Default</Button>
          <Button size='large' disabled icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='large' disabled icon={<DownloadOutlined />} />
        </Space>
      </p>
    </>
  )).add('Toggle', () => (
    <p>
      <Space>
        <ToggleButton enableText='Remove' disableText='Add' />
      </Space>
    </p>
  ))
