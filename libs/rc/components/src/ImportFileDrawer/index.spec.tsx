import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen, within } from '@acx-ui/test-utils'

import { CsvSize, ImportFileDrawer } from '.'

const props = {
  title: 'Import from file',
  acceptType: ['csv'],
  visible: true,
  templateLink: '#',
  maxSize: CsvSize['5MB'],
  maxEntries: 512,
  importRequest: ()=>{}
}

describe('Import CSV Drawer', () => {

  it('should render correctly', async () => {
    render(<ImportFileDrawer type='AP'
      {...props}
    />)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toMatchSnapshot()


    const csvFile = new File([''], 'aps_import_template.csv', { type: 'text/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
  })

  it('show errors', async () => {
    const errorRes = {
      downloadUrl: 'https://aaa.cc/tenant/d1ec841a4ff74436b23bca6477f6a631/002.csv',
      txId: 'e958a36f-9048-4c80-bd7a-f834c7b9dc13',
      fileErrorsCount: 3,
      errors: [{
        code: 422,
        description: 'AP name - Please use only allowed characters. In row: 1'
      }, {
        code: 422,
        description: `AP Group not identified.
        You must create an AP Group prior to import. In row: 1`
      }, {
        code: 422,
        description: 'Serial number is invalid. In row: 1'
      }]
    }
    render(<ImportFileDrawer type='AP'
      {...props}
      importError={{
        status: 422,
        data: errorRes
      }}
    />)
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveTextContent('3 errors found.')

    fireEvent.click(await within(dialog).findByRole('link', { name: 'See errors' }))
  })

  it('upload file', async () => {
    render(<ImportFileDrawer type='AP'
      {...props}
    />)
    const dialog = await screen.findByRole('dialog')
    const pngFile = new File(['(⌐□_□)'], 'chucknorris.csv', { type: 'image/png' })
    Object.defineProperty(pngFile, 'size', { value: props.maxSize+1024*1024 })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, pngFile)
    expect(dialog).toHaveTextContent('File size (6 MB) is too big.')
  })
})
