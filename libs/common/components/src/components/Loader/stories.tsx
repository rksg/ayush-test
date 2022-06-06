import React from 'react'

import { storiesOf } from '@storybook/react'

import { Loader } from '.'

const contents = <>
  <p>Content</p>
  <p>Content</p>
  <p>Content</p>
  <p>Content</p>
  <p>Content</p>
</>

storiesOf('Loader', module)
  .add('isLoading', () => <div style={{ height: '150px', display: 'flex' }}><Loader
    states={[{ isLoading: true }]}
    children={contents} /></div>)
  .add('isFetching', () => <Loader
    states={[{ isLoading: false, isFetching: true }]}
    children={contents} />)
  .add('error', () => <Loader
    states={[{ isLoading: false, error: new Error('error!') }]}
    children={contents} />)

export {}
