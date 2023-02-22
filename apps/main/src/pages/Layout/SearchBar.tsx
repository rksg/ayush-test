import React, { useContext, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  LayoutUI
}                        from '@acx-ui/components'
import { Tooltip }                from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  SearchOutlined,
  Close
}                          from '@acx-ui/icons'
import { HeaderContext }                                       from '@acx-ui/main/components'
import { useNavigate, useParams, useTenantLink , useLocation } from '@acx-ui/react-router-dom'
import { notAvailableMsg, fixedEncodeURIComponent }            from '@acx-ui/utils'

import * as UI from './styledComponents'

function SearchBar () {
  const enableSearch = useIsSplitOn(Features.GLOBAL_SEARCH)
  const notAvailableTitle = useIntl().$t(notAvailableMsg)
  const placeholder = useIntl().$t({ defaultMessage: 'What are you looking for?' })
  const params = useParams()
  const { pathname, key } = useLocation()
  const searchFromUrl = params.searchVal || ''
  // const [ showSearchBar, setShowSearchBar ] = useState(searchFromUrl !== '')
  const { searchExpanded: showSearchBar,
    setSearchExpanded: setShowSearchBar, setLicenseExpanded
  } = useContext(HeaderContext)
  const [ searchText, setSearchText ] = useState(searchFromUrl)
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const setSearchUrl = () => {
    if (searchText.trim() === '') return
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/search/${fixedEncodeURIComponent(searchText)}`
    }, { replace: pathname.includes('/search/') ? true : false })
  }
  const closeSearch = () => {
    setSearchText('')
    setShowSearchBar(false)
    if (pathname.includes('/search/')) {
      if (key === 'default') { // user came directly to search page, no history
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/dashboard`
        }, { replace: true })
      } else {
        navigate(-1)
      }
    }
  }

  const handleSearch = () => {
    if (searchText.length <= 1) return
    setSearchUrl()
  }

  const onKeyDown = (event: React.KeyboardEvent) => event.key === 'Enter' && handleSearch()

  return (enableSearch
    ? showSearchBar
      ? <UI.SearchBar>
        <UI.SearchSolid shape='circle' icon={<SearchOutlined />}/>
        <UI.Input
          autoFocus
          value={searchText}
          onChange={({ target: { value } }) => setSearchText(value)}
          onKeyDown={onKeyDown}
          data-testid='search-input'
          placeholder={placeholder}
        />
        <UI.SendSearch onClick={handleSearch} data-testid='search-send'/>
        <UI.Divider />
        <UI.Close
          shape='circle'
          icon={<Close />}
          onClick={closeSearch}
          data-testid='search-close'
        />
      </UI.SearchBar>
      : <LayoutUI.ButtonOutlined
        shape='circle'
        icon={<SearchOutlined />}
        onClick={
          () => {
            setShowSearchBar(true)
            setLicenseExpanded(false)
          }
        }
        data-testid='search-button'
      />
    : <Tooltip title={notAvailableTitle}>
      <LayoutUI.ButtonOutlined
        disabled
        shape='circle'
        icon={<SearchOutlined />}
        data-testid='search-button'
      />
    </Tooltip>
  )
}
export default SearchBar
