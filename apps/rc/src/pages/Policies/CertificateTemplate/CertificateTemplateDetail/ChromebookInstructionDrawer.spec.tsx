import userEvent from '@testing-library/user-event'

import { AlgorithmType, CertificateExpirationType, CertificateTemplate, ChromebookEnrollmentType } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { render, screen }                                                                          from '@acx-ui/test-utils'

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
    enrollmentUrl: 'chromebookEnrollmentUrl',
    enrollmentType: ChromebookEnrollmentType.DEVICE
  },
  keyLength: 0,
  algorithm: AlgorithmType.SHA_256
}

describe('ChromebookInstructionDrawer', () => {
  const onCloseFn = jest.fn()

  afterAll(() => {
    jest.resetAllMocks()
  })

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
    // eslint-disable-next-line max-len
    const expectedEnrollmentType = mockData.chromebook?.enrollmentType === ChromebookEnrollmentType.DEVICE ? '"Value": "system"' : '"Value": "user"'

    screen.getByText('Chromebook Setup Instructions')
    screen.getAllByText(RegExp(expectedCAName))
    screen.getByText(RegExp(expectedEnrollmentUrl))
    screen.getByText(RegExp(expectedEnrollmentType))

    await userEvent.click(screen.getAllByRole('button', { name: /Close/i })[0])
    expect(onCloseFn).toHaveBeenCalled()
  })

  it('should allow download button in instruction drawer', async () => {
    render(
      <Provider>
        <ChromebookInstructionDrawer
          data={mockData}
          onClose={onCloseFn}
        />
      </Provider>
    )
    const mockCreateElement = jest.fn().mockReturnValue({})
    global.document.createElement = mockCreateElement
    const downloadButton = screen.getByText(/Download JSON as File/i)
    await userEvent.click(downloadButton)

    expect(mockCreateElement).toHaveBeenCalled()
  })
})
