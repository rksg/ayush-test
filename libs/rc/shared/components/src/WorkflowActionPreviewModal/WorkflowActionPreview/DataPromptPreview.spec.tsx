import { DataPromptAction } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'

import { mockDataPrompt }    from './__tests__/fixtures'
import { DataPromptPreview } from './DataPromptPreview'


jest.mock('@acx-ui/rc/services')

describe('Data Prompt Preview', () => {

  it('renders the Data Prompt Preview', async () => {
    render(
      <Provider>
        <DataPromptPreview data={mockDataPrompt} />
      </Provider>)

    expect(await screen.findByText(mockDataPrompt.title as string)).toBeVisible()
    expect(await screen.findByText(mockDataPrompt.messageHtml as string)).toBeVisible()

    // @ts-ignore
    expect(await screen.findByText(mockDataPrompt.variables[0].label)).toBeVisible()
    // @ts-ignore
    expect(await screen.findByText(mockDataPrompt.variables[1].label)).toBeVisible()
  })

  it('renders the Data Prompt Preview without title and messageHtml', async () => {
    const data: DataPromptAction = {
      ...mockDataPrompt,
      displayTitle: false,
      displayMessageHtml: false
    }

    render(
      <Provider>
        <DataPromptPreview data={data} />
      </Provider>)

    expect(screen.queryByText(data.title as string)).toBeNull()
    expect(screen.queryByText(data.messageHtml as string)).toBeNull()

    // @ts-ignore
    expect(await screen.findByText(data.variables[0].label)).toBeVisible()
    // @ts-ignore
    expect(await screen.findByText(data.variables[1].label)).toBeVisible()
  })

})