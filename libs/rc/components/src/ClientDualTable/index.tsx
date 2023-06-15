import { useState, SyntheticEvent, useContext } from 'react'

import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Anchor, Tooltip } from '@acx-ui/components'

import { ConnectedClientsTable }  from '../ConnectedClientsTable'
import { HistoricalClientsTable } from '../HistoricalClientsTable'

import { ClientTabContext }                                          from './context'
import { ClientLink, ClientSearchBar, SearchBarDiv, SearchCountDiv } from './styledComponents'

export function ClientDualTable () {
  const { setClientCount } = useContext(ClientTabContext)
  const { $t } = useIntl()
  const [searchValue, setSearchValue] = useState('')
  const [connectedClientCount, setConnectedClientCount] = useState<number>(0)
  const [historicalClientCount, setHistoricalClientCount] = useState<number>(0)

  const getSearchToolTipText = () => {
    return defineMessage({ defaultMessage: `
      <div>You can search for clients by the following properties *:
        <ul><li>Client MAC Address</li>
        <li>User Name</li>
        <li>Host Name</li>
        <li>OS Type (Connected Clients Only)</li>
        <li>IP Address (Connected Clients Only)</li>
        <li>VLAN ID (Connected Clients Only)</li></ul>
      <div>* Search ignores columns that you chose to hide</div></div>` })
  }

  const scrollToTarget = (e: SyntheticEvent, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if(element){
      window.scrollTo({ top: element.offsetHeight })
    }
  }
  setClientCount?.(connectedClientCount)

  return <>
    <div id='ClientsTable'>
      <SearchBarDiv>
        <ClientSearchBar
          placeHolder={
            $t({ defaultMessage: 'Search for connected and historical clients...' })}
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
      <SearchCountDiv>
        {searchValue.length >= 2 &&
          $t({ defaultMessage: 'Search Results: {connectedClientCount} Connected clients | ' },
            { connectedClientCount })
        }
        {searchValue.length >= 2 &&
          <Anchor onClick={(e) => scrollToTarget(e, 'ClientsTable')}>
            <ClientLink
              data-testid='historicalLink'
              title={$t({ defaultMessage: '{historicalClientCount} Historical clients' },
                { historicalClientCount })} />
          </Anchor>}
      </SearchCountDiv>
      <ConnectedClientsTable
        searchString={searchValue}
        setConnectedClientCount={setConnectedClientCount} />
    </div>
    {/* TODO: change string from search input */}
    { searchValue.length >= 2 &&
      <HistoricalClientsTable
        searchString={searchValue}
        setHistoricalClientCount={setHistoricalClientCount} />}
  </>
}
