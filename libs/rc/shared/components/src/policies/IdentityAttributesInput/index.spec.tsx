import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { IdentityAttributesInput } from './index'

describe('IdentityAttributesInput', () => {
  it('should render successfully', () => {
    render(
      <Provider>
        <Form>
          <IdentityAttributesInput fieldLabel='Identity Attributes' attributeMappings={[]} />
        </Form>
      </Provider>
    )
    expect(screen.getByText('Identity Attributes')).toBeInTheDocument()
  })


  // The type option should be filtered by the attributeMappings
  it('should filter the type option by the attributeMappings', async () => {
    render(
      <Provider>
        <Form>
          <IdentityAttributesInput fieldLabel='Identity Attributes'
          />
        </Form>
      </Provider>
    )

    const addButton = screen.getByText('Add custom field')
    userEvent.click(addButton)
    // wait for the title to be rendered
    expect(await screen.findByText('Identity Attribute 1')).toBeInTheDocument()

    // find the attribute type dropdown
    const attributeTypeDropdown = screen.getByRole('combobox', { name: 'Attribute Type' })
    userEvent.click(attributeTypeDropdown)
    // select First Name
    const firstNameOption = await screen.findByText('First Name')
    userEvent.click(firstNameOption)

    userEvent.click(addButton)
    // wait for the title to be rendered
    expect(await screen.findByText('Identity Attribute 2')).toBeInTheDocument()

    // find the second attribute type dropdown
    const attributeTypeDropdowns = screen.getAllByRole('combobox', { name: 'Attribute Type' })
    const attributeTypeDropdown2 = attributeTypeDropdowns[1]
    userEvent.click(attributeTypeDropdown2)
    const lastNameOption = await screen.findByText('Last Name')
    userEvent.click(lastNameOption)

    // check the type option should have last name
    const typeOption = screen.queryByText('Last Name')
    expect(typeOption).toBeInTheDocument()
  })
})