import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { RulesManagementUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import { policySetList } from '../__test__/fixtures'

import MoreSettingsForm from './MoreSettingsForm'


describe('MoreSettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      )
    )
  })
  it('should render More Settings', async () => {
    render(<Provider><Form><MoreSettingsForm /></Form></Provider>)
    const titleElement = screen.getByText('More Settings')
    const sectionElement = screen.queryAllByText('Adaptive Policy Set')
    const dropdownElement = screen.getByRole('combobox')
    expect(titleElement).toBeInTheDocument()
    expect(sectionElement).toHaveLength(2)
    expect(dropdownElement).toBeInTheDocument()
    await userEvent.click(dropdownElement)
    await userEvent.click(await screen.findByText('ps12'))
    const selectionControlElement = screen.getByText('Default Access')
    expect(selectionControlElement).toBeInTheDocument()
  })
})
