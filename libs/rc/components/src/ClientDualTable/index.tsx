import { useState } from 'react'

import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Anchor, Tooltip }                               from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                    from '@acx-ui/icons'
import { ConnectedClientsTable, HistoricalClientsTable } from '@acx-ui/rc/components'

import { ClientLink, ClientSearchBar, SearchBarDiv, SearchCountDiv } from './styledComponents'

export function ClientDualTable () {
  const intl = useIntl()
  const [searchValue, setSearchValue] = useState('')
  const [connectedClientCount, setConnectedClientCount] = useState<number>(0)
  const [historicalClientCount, setHistoricalClientCount] = useState<number>(0)

  const getSearchToolTipText = () => {
    // eslint-disable-next-line max-len
    return defineMessage({ defaultMessage: '<div>You can search for clients by the following properties*: <ul><li>Client MAC Address</li><li>AP MAC Address</li><li>OS Type</li><li>User Name</li><li>Host Name</li></ul><div>* Search ignores columns that you chose to hide</div></div>' })
  }

  return <>
    {useIsSplitOn(Features.USERS) &&
    <>
      <SearchBarDiv>
        <ClientSearchBar
          placeHolder={
            intl.$t({ defaultMessage: 'Search for connected and historical clients...' })}
          onChange={async (value)=>{
            if(value.length === 0 || value.length >= 2){
              setSearchValue(value)
            }
          }}
        />
        <Tooltip
          title={<FormattedMessage {...getSearchToolTipText()}
            values={{
              div: (contents) => <div>{contents}</div>,
              ul: (contents) => <ul>{contents}</ul>,
              li: (contents) => <li>{contents}</li>
            }}/>}
          placement='bottom'
          style={{ gap: '10px' }}
        >
          <QuestionMarkCircleOutlined />
        </Tooltip>
      </SearchBarDiv>
      <SearchCountDiv>
        {searchValue.length >= 2 &&
          intl.$t({ defaultMessage: 'Search Results: {connectedClientCount} Connected clients | ' },
            { connectedClientCount })
        }
        {searchValue.length >= 2 &&
          <Anchor onClick={(e) => e.preventDefault()}>
            <ClientLink
              data-testid='historicalLink'
              href='#HistoricalClientsTable'
              title={intl.$t({ defaultMessage: '{historicalClientCount} Historical clients' },
                { historicalClientCount })} />
          </Anchor>}
      </SearchCountDiv>
    </>
    }
    <ConnectedClientsTable
      searchString={searchValue}
      setConnectedClientCount={setConnectedClientCount} />
    {/* TODO: change string from search input */}
    { searchValue.length >= 2 &&
      <HistoricalClientsTable
        id='HistoricalClientsTable'
        searchString={searchValue}
        setHistoricalClientCount={setHistoricalClientCount} />}
  </>
}
