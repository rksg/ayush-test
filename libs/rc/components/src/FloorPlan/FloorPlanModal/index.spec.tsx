import '@testing-library/jest-dom'

import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import AddEditFloorplanModal, { getFileExtension } from '.'


describe('Floor Plan Modal', () => {

  it('should render correctly', async () => {
    const onAddEditFloorPlan = jest.fn()
    const { asFragment } = render(<Provider><AddEditFloorplanModal
      buttonTitle='+ Add Floor Plan'
      onAddEditFloorPlan={onAddEditFloorPlan}
      isEditMode={false}/></Provider>)
    const component = await screen.findByText('+ Add Floor Plan')
    expect(component).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles click on add floorplan', async () => {
    const onAddEditFloorPlan = jest.fn()
    const { asFragment } = render(<Provider><AddEditFloorplanModal
      buttonTitle='+ Add Floor Plan'
      onAddEditFloorPlan={onAddEditFloorPlan}
      isEditMode={false}/></Provider>)

    const component = await screen.findByText('+ Add Floor Plan')
    await fireEvent.click(component)

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await expect(saveBtn).toBeVisible()

    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' })
    await expect(cancelBtn).toBeVisible()
    await fireEvent.click(cancelBtn)

    expect(cancelBtn).not.toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('test getFileExtension method', async () => {
    const jpgFileExtension = getFileExtension('file1.jpg')
    expect(jpgFileExtension).toEqual('jpg')
    const iinvalidFileExtension = getFileExtension('file1.ott')
    expect(iinvalidFileExtension).toEqual('')
  })
})
