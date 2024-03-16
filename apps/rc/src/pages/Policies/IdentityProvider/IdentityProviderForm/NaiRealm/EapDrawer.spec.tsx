import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { editDataWithRealms } from '../../__tests__/fixtures'

import EapDrawer from './EapDrawer'

describe('NaiRealmDrawer Component', () => {
  const mockSetVisible = jest.fn()
  const mockUpdateDataList = jest.fn()

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockUpdateDataList.mockClear()
  })

  it('Render EapDrawer component with create mode successfully', async () => {
    render(<EapDrawer
      visible={true}
      setVisible={mockSetVisible}
      editIndex={-1}
      dataList={[]}
      updateDataList={mockUpdateDataList} />
    )

    const title = await screen.findByText('Add EAP Method')
    expect(title).toBeVisible()

    const eapMethodCombo = await screen.findByRole('combobox', { name: /EAP Method/ })
    await userEvent.click(eapMethodCombo)
    await userEvent.click(await screen.findByText('EAP-TLS'))

    const addAuthBtn = await screen.findByRole('button', { name: 'Add another Auth' })
    await userEvent.click(addAuthBtn)

    const authCombo = await screen.findByRole('combobox', { name: /Auth Type/ })
    expect(authCombo).toBeInTheDocument()
    await userEvent.click(authCombo)
    await userEvent.click(await screen.findByText('Tunneled EAP Credential'))
    const subTypeCombo = await screen.findByRole('combobox', { name: /SubType/ })
    await userEvent.click(subTypeCombo)
    await userEvent.click(await screen.findByText('Anonymous'))

    await userEvent.click(addAuthBtn)
    const authCombos = await screen.findAllByRole('combobox', { name: /Auth Type/ })
    expect(authCombos.length).toBe(2)
    await userEvent.click(authCombos[1])
    const expandedInnerEAPOption = await screen.findAllByText('Expanded Inner EAP')
    await userEvent.click(expandedInnerEAPOption[1])
    const vendorIdInput = await screen.findByRole('spinbutton', { name: /Vendor ID/ })
    await userEvent.type(vendorIdInput, '10')
    const vendorTypeInput = await screen.findByRole('spinbutton', { name: /Vendor Type/ })
    await userEvent.type(vendorTypeInput, '11')


    const addBtn = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })

  it('Render EapDrawer component with edit mode successfully', async () => {
    const editData = editDataWithRealms.naiRealms[0].eap
    render(<EapDrawer
      visible={true}
      setVisible={mockSetVisible}
      editIndex={0}
      dataList={editData}
      updateDataList={mockUpdateDataList} />
    )

    const title = await screen.findByText('Edit EAP Method')
    expect(title).toBeVisible()

    // EAP Method Combobox
    expect(await screen.findByText('MD5-Challenge')).toBeVisible()

    let authCombos = await screen.findAllByRole('combobox', { name: /Auth Type/ })
    expect(authCombos.length).toBe(4)
    expect(screen.queryByRole('button', { name: 'Add another Auth' })).toBeNull()

    const deleteBtns = await screen.findAllByRole('button', { name: 'delete' })
    expect(deleteBtns.length).toBe(4)
    await userEvent.click(deleteBtns[0])

    authCombos = await screen.findAllByRole('combobox', { name: /Auth Type/ })
    expect(authCombos.length).toBe(3)

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })
})