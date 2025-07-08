import React, { useState } from 'react'

import { ComponentStory } from '@storybook/react'
import { BrowserRouter }  from 'react-router-dom'

import { HeaderContext } from './HeaderContext'

import { GlobalSearchBar } from './index'

const story = {
  title: 'GlobalSearchBar',
  component: GlobalSearchBar
}

export default story

const Template: ComponentStory<typeof GlobalSearchBar> = () => {
  const [searchExpanded, setSearchExpanded] = useState(true)
  const [licenseExpanded, setLicenseExpanded] = useState(false)

  const contextValue = {
    searchExpanded,
    setSearchExpanded,
    licenseExpanded,
    setLicenseExpanded
  }

  return (
    <BrowserRouter>
      <HeaderContext.Provider value={contextValue}>
        <div style={{ padding: '20px', backgroundColor: '#001529' }}>
          <GlobalSearchBar />
        </div>
      </HeaderContext.Provider>
    </BrowserRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}
Default.storyName = 'With Expanded Searchbar'
