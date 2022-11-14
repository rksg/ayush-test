import { useIntl } from 'react-intl'
import { useState } from 'react'
import {
  LayoutUI
}                        from '@acx-ui/components'
import { Tooltip } from '@acx-ui/components'
import { notAvailableMsg }    from '@acx-ui/utils'
import {
  SearchOutlined,
  Close
}                          from '@acx-ui/icons'
import { useNavigate, useParams, useTenantLink , useLocation } from '@acx-ui/react-router-dom'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import * as UI from './styledComponents'

function SearchBar() {
  const enableSearch = useIsSplitOn(Features.GLOBAL_SEARCH)
  const params = useParams()
  const { pathname } = useLocation()
  const searchFromUrl = decodeURIComponent(params.searchVal || '')
  const [ showSearchBar, setShowSearchBar ] = useState(searchFromUrl !== '')
  const [ searchText, setSearchText ] = useState(searchFromUrl)
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const setSearchUrl = () => {
    if (searchText.trim() === '') return
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/search/${encodeURIComponent(searchText)}`
    }, { replace: pathname.includes('/search/') ? true : false })
  }
  const cancelSearch = () => {
    setSearchText('')
    setShowSearchBar(false)
    if (pathname.includes('/search/')) navigate(-1)
  }
  return <>
    { enableSearch
    ? showSearchBar
      ? <UI.SearchBar>
          <UI.SearchSolid shape='circle' icon={<SearchOutlined />} />
          <UI.Input
            autoFocus
            value={searchText}
            onChange={({ target: { value } }) => setSearchText(value)}
          />
          <UI.SendSearch onClick={setSearchUrl}/>
          <UI.Divider />
          <UI.Close
            shape='circle'
            icon={<Close />}
            onClick={cancelSearch} />
        </UI.SearchBar>
      : <LayoutUI.ButtonOutlined
          shape='circle'
          icon={<SearchOutlined />}
          onClick={() => setShowSearchBar(true)}
        />
    : <Tooltip title={useIntl().$t(notAvailableMsg)}>
        <LayoutUI.ButtonOutlined disabled shape='circle' icon={<SearchOutlined />} />
      </Tooltip>
    }
  </>
}
export default SearchBar
