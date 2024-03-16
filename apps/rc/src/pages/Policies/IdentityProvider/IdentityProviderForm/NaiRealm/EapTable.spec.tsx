
import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { editDataWithRealms } from '../../__tests__/fixtures'

import EapTable from './EapTable'


describe('EapTable Component', () => {
  const mockSetData = jest.fn()

  beforeEach(() => {
    mockSetData.mockClear()
  })

  it('Render EapTable component successfully', async () => {
    render(<EapTable
      data={undefined}
      setData={mockSetData} />
    )

    // Table header
    expect(await screen.findByText('EAP Method')).toBeVisible()
    expect(await screen.findByText('Auth')).toBeVisible()

    // Add EAP Method
    expect(await screen.findByText('Add EAP Method')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add EAP Method' }))

    // open drawer
    expect(await screen.findByText('Add another EAP Method')).toBeInTheDocument()
  })

  it('Render EapTable component with data successfully', async () => {
    const editData = editDataWithRealms.naiRealms[0].eap
    render(<EapTable
      data={editData}
      setData={mockSetData} />
    )

    // delete eap1 data
    const eap1 = await screen.findByText('MD5-Challenge')
    expect(eap1).toBeVisible()
    expect(await screen.findByText('4')).toBeVisible()
    await userEvent.click(eap1)

    let editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    let deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(deleteButton)
    expect(editButton).not.toBeInTheDocument()

    // edit eap2 data
    const eap2 = await screen.findByText('PEAP')
    expect(eap2).toBeVisible()
    expect(await screen.findByText('3')).toBeVisible()
    await userEvent.click(eap2)

    editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(editButton)
    expect(editButton).not.toBeInTheDocument()

    expect(await screen.findByText('Edit EAP Method')).toBeInTheDocument()
  })
})