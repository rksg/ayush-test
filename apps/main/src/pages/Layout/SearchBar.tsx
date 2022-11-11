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
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import * as UI from './styledComponents'

function SearchBar() {
  const enableSearch = useIsSplitOn(Features.GLOBAL_SEARCH)
  const [ showSearchBar, setShowSearchBar ] = useState(false)
  return <>
    { enableSearch
    ? showSearchBar
      ? <UI.SearchBar>
          <UI.SearchSolid shape='circle' icon={<SearchOutlined />} />
          <UI.Input autoFocus/>
          <UI.SendSearch />
          <UI.Divider />
          <UI.Close shape='circle' icon={<Close />} onClick={() => setShowSearchBar(false)} />
        </UI.SearchBar>
      : <LayoutUI.ButtonOutlined shape='circle' icon={<SearchOutlined />} onClick={() => setShowSearchBar(true)}/>
    : <Tooltip title={useIntl().$t(notAvailableMsg)}>
        <LayoutUI.ButtonOutlined disabled shape='circle' icon={<SearchOutlined />} />
      </Tooltip>
    }
  </>
}
export default SearchBar
