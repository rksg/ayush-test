import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ConfigTemplateCloneUrlsInfo, ConfigTemplateType, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { render, screen, waitFor, mockServer, renderHook }                         from '@acx-ui/test-utils'

import { mockedConfigTemplateList } from '../../__tests__/fixtures'

import { checkTemplateTypeValidity, ConfigTemplateCloneModal, useCloneConfigTemplate } from '.'


describe('ConfigTemplateCloneModal', () => {
  // eslint-disable-next-line max-len
  const targetNetworkTemplate = mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.NETWORK)!
  const props = {
    setVisible: jest.fn(),
    selectedTemplate: targetNetworkTemplate
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
    // eslint-disable-next-line max-len
    expect(screen.getByLabelText('Template Name')).toHaveValue(`${targetNetworkTemplate.name} - CLONE`)
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
      return t.type === ConfigTemplateType.NETWORK && t.name !== targetNetworkTemplate.name
    })!

    render(<Provider><ConfigTemplateCloneModal {...props} /></Provider>)
    const nameInput = screen.getByLabelText('Template Name')
    expect(nameInput).toHaveValue(`${targetNetworkTemplate.name} - CLONE`)
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

  describe('checkTemplateTypeValidity', () => {
    const availabilityMap = {
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.VENUE]: false,
      [ConfigTemplateType.DPSK]: false,
      [ConfigTemplateType.WIFI_CALLING]: false
    }

    it('should return false when templateType is undefined', () => {
      expect(checkTemplateTypeValidity(undefined, availabilityMap)).toBe(false)
    })

    it('should return false when templateType is not in allowed list', () => {
      // eslint-disable-next-line max-len
      expect(checkTemplateTypeValidity(ConfigTemplateType.WIFI_CALLING, availabilityMap)).toBe(false)
    })

    it('should return false when templateType is allowed but feature flag is off', () => {
      expect(checkTemplateTypeValidity(ConfigTemplateType.VENUE, availabilityMap)).toBe(false)
    })

    it('should return true when templateType is allowed and feature flag is on', () => {
      expect(checkTemplateTypeValidity(ConfigTemplateType.NETWORK, availabilityMap)).toBe(true)
    })
  })

  describe('useCloneConfigTemplate', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useCloneConfigTemplate())

      expect(result.current.visible).toBe(false)
      expect(typeof result.current.setVisible).toBe('function')
      expect(typeof result.current.canClone).toBe('function')
    })
  })
})
