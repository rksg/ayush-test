import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import { IntlProvider }   from 'react-intl'

import { RadiusOptionsForm } from '.'


describe('RADIUS Options Form component', () => {

  it('Should render Network RADIUS Options Form', async () => {
    render(
      <IntlProvider locale='en'>
        <Form>
          <RadiusOptionsForm context={'network'} showSingleSessionIdAccounting={false} />
        </Form>
      </IntlProvider>
    )

    await userEvent.click(await screen.findByRole('combobox', { name: 'NAS ID' }))
    await userEvent.click((await screen.findByTitle('User-defined')))

    const inputElm = await screen.findByRole('textbox', { name: 'Custom NAS ID' })
    await userEvent.type(inputElm, 'test1234')
  })

  it('Should render Venue RADIUS Options Form', async () => {
    const handleChanged = () => {}
    render(
      <IntlProvider locale='en'>
        <Form>
          <RadiusOptionsForm
            context={'venue'}
            showSingleSessionIdAccounting={true}
            onDataChanged={handleChanged}/>
        </Form>
      </IntlProvider>
    )

    await userEvent.click(await screen.findByRole('radio', { name: 'Colon' }))

  })
})
