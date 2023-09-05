import { storiesOf } from '@storybook/react'
import { Space }     from 'antd'

import { DownloadOutlined } from '@acx-ui/icons'

import { Button } from '.'

storiesOf('Button', module)
  .add('Small', () => (
    <>
      <p>
        <Space>
          <Button size='small' type='primary'>Primary</Button>
          <Button size='small'>Default</Button>
          <Button size='small' icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='small' icon={<DownloadOutlined />} />
          <Button size='small' href={'localhost'}>With href</Button>
          <Button size='small' type='link'>Link</Button>
        </Space>
      </p>
      <p>
        <Space>
          <Button size='small' disabled type='primary'>Primary</Button>
          <Button size='small' disabled>Default</Button>
          <Button size='small' disabled icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='small' disabled icon={<DownloadOutlined />} />
          <Button size='small' disabled href={'localhost'}>With href</Button>
          <Button size='small' disabled type='link'>Link</Button>
        </Space>
      </p>
    </>
  ))
  .add('Medium', () => (
    <>
      <p>
        <Space>
          <Button type='primary'>Primary</Button>
          <Button>Default</Button>
          <Button icon={<DownloadOutlined />}>With Icon</Button>
          <Button icon={<DownloadOutlined />} />
          <Button href={'localhost'} icon={<DownloadOutlined />}>With href</Button>
          <Button type='link'>Link</Button>
        </Space>
      </p>
      <p>
        <Space>
          <Button disabled type='primary'>Primary</Button>
          <Button disabled>Default</Button>
          <Button disabled icon={<DownloadOutlined />}>With Icon</Button>
          <Button disabled icon={<DownloadOutlined />} />
          <Button disabled href={'localhost'} icon={<DownloadOutlined />}>With href</Button>
          <Button disabled type='link'>Link</Button>
        </Space>
      </p>
    </>
  ))
  .add('Large', () => (
    <>
      <p>
        <Space>
          <Button size='large' type='primary'>Primary</Button>
          <Button size='large'>Default</Button>
          <Button size='large' icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='large' icon={<DownloadOutlined />} />
          <Button size='large' href={'localhost'}>With href</Button>
          <Button size='large' type='link'>Link</Button>
        </Space>
      </p>
      <p>
        <Space>
          <Button size='large' disabled type='primary'>Primary</Button>
          <Button size='large' disabled>Default</Button>
          <Button size='large' disabled icon={<DownloadOutlined />}>With Icon</Button>
          <Button size='large' disabled icon={<DownloadOutlined />} />
          <Button size='large' disabled href={'localhost'}>With href</Button>
          <Button size='large' disabled type='link'>Link</Button>
        </Space>
      </p>
    </>
  ))
