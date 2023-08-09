
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ChannelBarControlPopover } from './ChannelBarControlPopover'

describe('RadioSettingForm component', () => {

  it('should render', async () => {
    const displayRadioBarSettings = ['5G', 'DFS']
    const updateChannelBarDisplaySettings = jest.fn()

    render(
      <Provider>
        <ChannelBarControlPopover
          initValue={displayRadioBarSettings}
          onChannelBarDisplayChanged={updateChannelBarDisplaySettings}
        />
      </Provider>
    )

    const link = await screen.findByRole('button', { name: /Channels display settings/i })
    await userEvent.click(link)

    const dfsCheckbox = await screen.findByRole('checkbox', { name: 'DFS' })
    expect(dfsCheckbox).toBeChecked()

    await userEvent.click(dfsCheckbox)
    expect(await screen.findByRole('checkbox', { name: 'DFS' })).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Close/i }))

    expect(updateChannelBarDisplaySettings).toBeCalled()
  })
})
