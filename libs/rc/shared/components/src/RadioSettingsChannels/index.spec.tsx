import React from 'react'

import { Provider  } from '@acx-ui/store'
import { render }    from '@acx-ui/test-utils'

import { RadioSettingsChannels } from './'

describe('RadioSettingsChannelse', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <RadioSettingsChannels
        formName={['apRadioParams24G', 'allowedChannels']}
        groupSize={1}
        channelList={['36', '40', '44', '48', '52', '56', '60', '64', '100', '104',
          '108', '112', '116', '120', '124', '128', '132',
          '136', '140', '144', '149', '153', '157', '161'].map(item => ({
          value: item,
          selected: ['36', '40', '44', '48', '52', '56', '60', '64', '100', '104',
            '108', '112', '116', '120', '124', '128', '132',
            '136', '140', '144', '149', '153', '157', '161']?.includes(item)
        }))}
        displayBarSettings={['5G', 'DFS']}
        channelBars={{
          dfsChannels: ['52', '56', '60', '64', '100', '104', '108',
            '112', '116', '120', '124', '128', '132', '136', '140', '144'],
          lower5GChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
          upper5GChannels: ['100', '104', '108', '112', '116', '120', '124',
            '128', '132', '136', '140', '144', '149', '153', '157', '161']
        }}
        disabled={false}
        editContext={React.createContext({})}
      /></Provider>)
  })
  it('should render group size of 4 correctly', async () => {
    const { asFragment } = render(<Provider>
      <RadioSettingsChannels
        formName={['apRadioParams24G', 'allowedChannels']}
        groupSize={4}
        channelList={['36', '40', '44', '48', '52', '56', '60', '64', '100', '104',
          '108', '112', '116', '120', '124', '128', '132',
          '136', '140', '144', '149', '153', '157', '161'].map(item => ({
          value: item,
          selected: ['36', '40', '44', '48', '52', '56', '60', '64', '100', '104',
            '108', '112', '116', '120', '124', '128', '132',
            '136', '140', '144', '149', '153', '157', '161']?.includes(item)
        }))}
        displayBarSettings={['5G', 'DFS']}
        channelBars={{
          dfsChannels: ['52', '56', '60', '64', '100', '104', '108',
            '112', '116', '120', '124', '128', '132', '136', '140', '144'],
          lower5GChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
          upper5GChannels: ['100', '104', '108', '112', '116', '120', '124',
            '128', '132', '136', '140', '144', '149', '153', '157', '161']
        }}
        disabled={false}
        editContext={React.createContext({})}
      /></Provider>)
    expect(asFragment()).toMatchSnapshot()
  })
})