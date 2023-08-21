import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { CsvSize, ImportErrorRes, ImportFileDrawer, ImportFileDrawerType } from '.'

const importRequest = jest.fn()
const props = {
  title: 'Import from file',
  acceptType: ['csv'],
  visible: true,
  templateLink: '#',
  maxSize: CsvSize['5MB'],
  maxEntries: 512,
  importRequest
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  antd.Typography.Link = ({ href, onClick, children }:
    React.PropsWithChildren<{ href: string, onClick: (e: MouseEvent) => void }>) => {
    return <a href={href}
      onClick={(e) => {
        e.preventDefault()
        onClick(e)
        // e.stopPropagation()
      }}>{children}</a>
  }
  return { ...antd }
})

describe('Import CSV Drawer', () => {
  afterEach(()=>{
    importRequest.mockClear()
  })

  it('should render correctly', async () => {
    render(<ImportFileDrawer type={ImportFileDrawerType.AP}
      {...props}
    />)

    const csvFile = new File([''], 'aps_import_template.csv', { type: 'text/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
    await waitFor(() => expect(importRequest).toBeCalled())
  })

  it('upload file with error', async () => {
    render(<ImportFileDrawer type={ImportFileDrawerType.AP}
      {...props}
    />)
    const dialog = await screen.findByRole('dialog')
    const pngFile = new File(['(⌐□_□)'], 'chucknorris.csv', { type: 'image/png' })
    Object.defineProperty(pngFile, 'size', { value: props.maxSize+1024*1024 })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, pngFile)
    expect(dialog).toHaveTextContent('File size (6 MB) is too big.')
  })

  it('upload file with readAsText', async () => {
    render(<ImportFileDrawer type={ImportFileDrawerType.AP}
      readAsText={true}
      {...props}
    />)
    const csvFile = new File([''], 'aps_import_template.csv', { type: 'text/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
    await waitFor(() => expect(importRequest).toBeCalledTimes(1))
  })

  it('upload file with readAsText and keep comma in result', async () => {
    render(<ImportFileDrawer type={ImportFileDrawerType.AP}
      readAsText={true}
      skipCsvTextConvert={true}
      {...props}
    />)
    const csvFile = new File(['mockdata,test,123'], 'aps_import_template.csv', { type: 'text/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
    await waitFor(() => expect(importRequest).toBeCalledTimes(1))
    expect(importRequest).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      'mockdata,test,123'
    )
  })

  it('should render extra descriptions', async () => {
    render(<ImportFileDrawer type={ImportFileDrawerType.AP}
      extraDescription={['extra description']}
      {...props}
    />)

    expect(await screen.findByText('extra description')).toBeVisible()
  })

  describe('errors from props', () => {

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
      render(<ImportFileDrawer type={ImportFileDrawerType.AP}
        {...props}
        importError={{
          status: 422,
          data: errorRes
        }}
      />)
      const dialog = await screen.findByRole('dialog')

      fireEvent.click(await within(dialog).findByRole('link', { name: 'See errors' }))

      expect(dialog).toHaveTextContent('3 errors found.')
    })

    it('should correctly render string error', async () => {
      render(<ImportFileDrawer
        type={ImportFileDrawerType.AP}
        importError='import error in string'
        {...props}
      />)

      expect(await screen.findByText('import error in string')).toBeVisible()
    })

    it('should correctly render request failed message', async () => {
      render(<ImportFileDrawer
        type={ImportFileDrawerType.AP}
        importError={{
          status: 422,
          data: {
            errors: [{
              code: 1000,
              message: 'import request failed message'
            }]
          } as ImportErrorRes }}
        {...props}
      />)

      await screen.findByRole('img', { name: 'warning' })
      expect(await screen.findByText('import request failed message')).toBeVisible()
    })

    it('should correctly render request failed empty data', async () => {
      render(<ImportFileDrawer
        type={ImportFileDrawerType.AP}
        importError={{
          status: 402,
          data: {} }}
        {...props}
      />)

      await screen.findByRole('button', { name: 'Import' })
      expect(screen.queryByRole('img', { name: 'warning' })).toBeNull()
    })

    it('should correctly render request failed error', async () => {
      render(<ImportFileDrawer
        type={ImportFileDrawerType.AP}
        importError={{
          status: 422,
          data: {
            error: {
              status: 422,
              rootCauseErrors: [{
                code: 'mocked-1000',
                message: 'import guest request failed message'
              }]
            }
          } }}
        {...props}
      />)

      await screen.findByRole('button', { name: 'Import' })
      expect(await screen.findByText('import guest request failed message')).toBeVisible()
    })
  })

  describe('custom validation', () => {
    it('should stop load file when validation failed', async () => {
      render(<ImportFileDrawer
        type={ImportFileDrawerType.AP}
        readAsText={true}
        validator={() => {
          return Promise.reject('test for invalid file')
        }}
        {...props}
      />)

      const csvFile = new File([''], 'mocked_import_template.csv', { type: 'text/csv' })
      // eslint-disable-next-line testing-library/no-node-access
      await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)
      const dialog = await screen.findByRole('dialog')
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))
      await within(dialog).findByRole('img', { name: 'warning' })
      expect(dialog).toHaveTextContent('test for invalid file')
    })

    it('should validation take no effect when readAsText !== true', async () => {
      const mockedValidator = jest.fn()
      render(<ImportFileDrawer
        type={ImportFileDrawerType.AP}
        validator={() => {
          mockedValidator()
          return Promise.reject('test for validation will not be invoked')
        }}
        {...props}
      />)

      const csvFile = new File([''], 'mocked_import_template.csv', { type: 'text/csv' })
      // eslint-disable-next-line testing-library/no-node-access
      await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)
      await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
      expect(mockedValidator).toBeCalledTimes(0)
    })
  })
})
