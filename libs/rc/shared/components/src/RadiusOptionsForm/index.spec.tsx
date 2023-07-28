
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'


import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { RadiusOptionsForm } from '.'


describe('RADIUS Options Form component', () => {

  it('Should render Network RADIUS Options Form', async () => {
    render(
      <Provider>
        <Form>
          <RadiusOptionsForm context={'network'} showSingleSessionIdAccounting={false} />
        </Form>
      </Provider>
    )

    await userEvent.click(await screen.findByRole('combobox', { name: 'NAS ID' }))
    await userEvent.click((await screen.findByTitle('User-defined')))

    const inputElm = await screen.findByRole('textbox', { name: 'Custom NAS ID' })
    await userEvent.type(inputElm, 'test1234')
  })

  it('Should render Venue RADIUS Options Form', async () => {
    const handleChanged = () => {}
    render(
      <Provider>
        <Form>
          <RadiusOptionsForm
            context={'venue'}
            showSingleSessionIdAccounting={true}
            onDataChanged={handleChanged}/>
        </Form>
      </Provider>
    )

    await userEvent.click(await screen.findByRole('radio', { name: 'Colon' }))

  })
})
