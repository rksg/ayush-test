import { ConfigTemplateType }      from '@acx-ui/rc/utils'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { ConfigTemplateOverrideModal } from '.'

describe('ConfigTemplateOverrideModal', () => {
  it('should render null when the ConfigTemplateType is not supported', async () => {
    const mockProps = {
      templateId: '1',
      templateType: ConfigTemplateType.NETWORK,
      onCancel: jest.fn(),
      updateOverrideValue: jest.fn()
    }

    render(<ConfigTemplateOverrideModal {...mockProps} />)

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
