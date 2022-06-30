import { storiesOf }  from '@storybook/react'
import { Typography } from 'antd'

import { Subtitle } from './styledComponents'

storiesOf('Typography', module)
  .add('Headlines', () => <>
    <Typography.Title level={1}>Headline 1</Typography.Title>
    <Typography.Title level={2}>Headline 2</Typography.Title>
    <Typography.Title level={3}>Headline 3</Typography.Title>
    <Typography.Title level={4}>Headline 4</Typography.Title>
    <Typography.Title level={5}>Headline 5</Typography.Title>
  </>)
  .add('Subtitles', () => <>
    <Subtitle level={1}>Subtitle 1</Subtitle>
    <Subtitle level={2}>Subtitle 2</Subtitle>
    <Subtitle level={3}>Subtitle 3</Subtitle>
    <Subtitle level={4}>Subtitle 4</Subtitle>
    <Subtitle level={5}>Subtitle 5</Subtitle>
  </>)

export {}
