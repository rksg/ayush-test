import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen, within } from '@acx-ui/test-utils'

import { CustomMappingFieldset } from './CustomMappingFieldset'

describe('CustomMappingFieldset Component', () => {
  it ('should render correctly', async () => {
    render(
      <Form>
        <CustomMappingFieldset />
      </Form>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))

    // check table has been created
    await screen.findByText('Custom String List ( 0/3 )')

    // show modal
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    // close modal
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it ('should add/delete entry correctly', async () => {
    render(
      <Form>
        <CustomMappingFieldset />
      </Form>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))
    await screen.findByText('Custom String List ( 0/3 )')

    // show modal to add entry
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await screen.findByText('Add Custom String')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), 'qqq')
    let addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(2)
    await userEvent.click(addButtons[1])

    await screen.findByText('Custom String List ( 1/3 )')
    await screen.findByRole('cell', { name: 'qqq' })
    await screen.findByRole('cell', { name: 'tcp' })

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(1)
    await userEvent.click(addButtons[0])
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), 'www')
    await userEvent.click(await screen.findByRole('radio', { name: 'UDP' }))
    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])

    await screen.findByText('Custom String List ( 2/3 )')
    await screen.findByRole('cell', { name: 'www' })
    await screen.findByRole('cell', { name: 'udp' })

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(1)
    await userEvent.click(addButtons[0])
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), 'yyy')
    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])

    await screen.findByText('Custom String List ( 3/3 )')
    await screen.findByRole('cell', { name: 'yyy' })
    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons[0]).toBeDisabled()

    // select a row and then delete entry
    let row = await screen.findByRole('row', { name: new RegExp('qqq') })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    await screen.findByText('Custom String List ( 2/3 )')
    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons[0]).toBeEnabled()
  })

  it ('should added entry unique', async () => {
    render(
      <Form>
        <CustomMappingFieldset />
      </Form>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))
    await screen.findByText('Custom String List ( 0/3 )')

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    // show modal
    await screen.findByText('Add Custom String')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), 'test')

    let addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(2)
    await userEvent.click(addButtons[1])

    await screen.findByText('Custom String List ( 1/3 )')
    await screen.findByRole('cell', { name: 'test' })
    await screen.findByRole('cell', { name: 'tcp' })

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(1)
    await userEvent.click(addButtons[0])
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), 'test')

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])
    await screen.findByText('Custom String Already Exists')
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
  })

  it ('should edited entry correctly', async () => {
    render(
      <Form>
        <CustomMappingFieldset />
      </Form>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))
    await screen.findByText('Custom String List ( 0/3 )')

    // show modal to add entry
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await screen.findByText('Add Custom String')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), 'qqq')
    let addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(2)
    await userEvent.click(addButtons[1])

    await screen.findByText('Custom String List ( 1/3 )')
    await screen.findByRole('cell', { name: 'qqq' })
    await screen.findByRole('cell', { name: 'tcp' })


    // select a row and then edit entry
    let row = await screen.findByRole('row', { name: new RegExp('qqq') })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    await screen.findByText('Edit Custom String')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Custom string' }), '_edit')
    let saveButtons = await screen.findAllByRole('button', { name: 'Save' })
    expect(saveButtons.length).toBe(1)
    await userEvent.click(saveButtons[0])

    await screen.findByText('Custom String List ( 1/3 )')
    await screen.findByRole('cell', { name: 'qqq_edit' })
    await screen.findByRole('cell', { name: 'tcp' })

  })

})
