import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ConfigTemplateCloneUrlsInfo, ConfigTemplateType, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { render, screen, waitFor, mockServer, renderHook }                         from '@acx-ui/test-utils'

import { mockedConfigTemplateList } from '../../__tests__/fixtures'

import { ConfigTemplateCloneModal, useCloneConfigTemplate } from '.'


describe('ConfigTemplateCloneModal', () => {
  // eslint-disable-next-line max-len
  const targetTemplate = mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.NETWORK)!
  const props = {
    setVisible: jest.fn(),
    selectedTemplate: targetTemplate
  }

  beforeEach(() => {
    props.setVisible.mockClear()

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getConfigTemplates.url,
        (req, res, ctx) => res(ctx.json({ ...mockedConfigTemplateList }))
      ),
      rest.post(
        ConfigTemplateCloneUrlsInfo[ConfigTemplateType.NETWORK].url,
        (req, res, ctx) => res(ctx.json({
          requestId: 'req-12345',
          response: { id: '12345' }
        }))
      )
    )
  })

  it('renders the modal correctly', () => {
    render(<Provider><ConfigTemplateCloneModal {...props} /></Provider>)
    expect(screen.getByText('Clone Template')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByLabelText('Template Name')).toHaveValue(`${targetTemplate.name} - CLONE`)
  })

  it('calls the handleSave function when the Save button is clicked', async () => {
    render(<Provider><ConfigTemplateCloneModal {...props} /></Provider>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(props.setVisible).toHaveBeenCalledTimes(1))
  })

  it('calls the handleCancel function when the Cancel button is clicked', async () => {
    render(<Provider><ConfigTemplateCloneModal {...props} /></Provider>)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(props.setVisible).toHaveBeenCalledTimes(1))
  })

  it('returns an error when the template name already exists', async () => {
    const existingTemplate = mockedConfigTemplateList.data.find(t => {
      return t.type === ConfigTemplateType.NETWORK && t.name !== targetTemplate.name
    })!

    render(<Provider><ConfigTemplateCloneModal {...props} /></Provider>)
    const nameInput = screen.getByLabelText('Template Name')
    expect(nameInput).toHaveValue(`${targetTemplate.name} - CLONE`)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, existingTemplate.name)

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage.textContent).toBe('The name already exists')
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })
  })

  describe('useCloneConfigTemplate', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useCloneConfigTemplate())

      expect(result.current.visible).toBe(false)
      expect(typeof result.current.setVisible).toBe('function')
      expect(typeof result.current.canClone).toBe('function')
    })

    it('should return true for allowed template types', () => {
      const { result } = renderHook(() => useCloneConfigTemplate())

      expect(result.current.canClone(ConfigTemplateType.NETWORK)).toBe(true)
      expect(result.current.canClone(ConfigTemplateType.VENUE)).toBe(true)
    })

    it('should return false for disallowed template types', () => {
      const { result } = renderHook(() => useCloneConfigTemplate())

      expect(result.current.canClone(ConfigTemplateType.WIFI_CALLING)).toBe(false)
      expect(result.current.canClone(undefined)).toBe(false)
    })
  })
})
