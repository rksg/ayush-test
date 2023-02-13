import { useState } from 'react'

import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import { ClientsTable }                  from './ClientsTable'
import { ClientSearchBar, SearchBarDiv } from './styledComponents'

export function SwitchClientsTable () {
  const { $t } = useIntl()

  const [searchValue, setSearchValue] = useState('')

  const getSearchToolTipText = () => {
    return defineMessage({ defaultMessage: `
        <div>You can search for clients by the following properties *:
          <ul><li>- MAC Address</li>
          <li>- Description</li>
          <li>- Device Type</li>
          <li>- Venue</li>
          <li>- Switch</li>
          <li>- VLAN</li></ul>
        <div>* Search ignores columns that you chose to hide</div></div>` })
  }

  return (
    <div>
      <SearchBarDiv>
        <ClientSearchBar
          placeHolder={
            $t({ defaultMessage: 'Search for clients' })}
          onChange={async (value)=>{
            if(value.length === 0 || value.length >= 2){
              setSearchValue(value)
            }
          }}
        />
        <Tooltip.Question
          title={<FormattedMessage {...getSearchToolTipText()}
            values={{
              div: (contents) => <div>{contents}</div>,
              ul: (contents) => <ul>{contents}</ul>,
              li: (contents) => <li>{contents}</li>
            }}/>}
          placement='bottom'
          style={{ gap: '10px' }}
        />
      </SearchBarDiv>
      <ClientsTable searchString={searchValue} />
    </div>
  )
}
