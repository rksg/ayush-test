import React from 'react'

import { storiesOf } from '@storybook/react'

import { SearchBar } from '.'

storiesOf('SearchBar', module)
  .add('Basic', () => <div style={{ width: '400px' }} >
    <SearchBar onChange={(value)=>{
      // eslint-disable-next-line no-console
      console.log(value)
    }}/>
  </div>)

export {}
