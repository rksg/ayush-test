import userEvent from '@testing-library/user-event'

import { AlgorithmType, CertificateExpirationType, CertificateTemplate } from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { render, screen }                                                from '@acx-ui/test-utils'

import ChromebookInstructionDrawer from './ChromebookInstructionDrawer'

const mockData: CertificateTemplate = {
  id: '',
  name: 'CertTemplate',
  caType: '',
  onboard: {
    certificateAuthorityId: '',
    commonNamePattern: '',
    notAfterType: CertificateExpirationType.DAYS_AFTER_TIME,
    notBeforeType: CertificateExpirationType.DAYS_AFTER_TIME,
    certificateAuthorityName: 'CA_name'
  },
  chromebook: {
    enabled: true,
    enrollmentUrl: 'chromebookEnrollmentUrl'
  },
  keyLength: 0,
  algorithm: AlgorithmType.SHA_256
}

describe('ChromebookInstructionDrawer', () => {
  const onCloseFn = jest.fn()
  it('should render instruction successfully', async () => {
    render(
      <Provider>
        <ChromebookInstructionDrawer
          data={mockData}
          onClose={onCloseFn}
        />
      </Provider>
    )
    const expectedCAName = mockData.onboard?.certificateAuthorityName ?? ''
    const expectedEnrollmentUrl = mockData.chromebook?.enrollmentUrl ?? ''

    screen.getByText('Chromebook Setup Instructions')
    screen.getAllByText(RegExp(expectedCAName))
    screen.getByText(RegExp(expectedEnrollmentUrl))

    await userEvent.click(screen.getAllByRole('button', { name: /Close/i })[0])
    expect(onCloseFn).toHaveBeenCalled()
  })
})
