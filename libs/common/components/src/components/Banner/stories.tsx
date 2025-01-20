import { storiesOf } from '@storybook/react'

import { Banner } from '.'

storiesOf('Banner', module).add('Basic', () => (
  <Banner
    title='TestTitle'
    subTitles={['subTitle1', 'subTitle2']}
    helpUrl='https://google.com'
    closable />
))
