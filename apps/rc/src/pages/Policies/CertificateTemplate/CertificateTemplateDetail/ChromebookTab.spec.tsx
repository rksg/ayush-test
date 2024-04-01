import { AlgorithmType, ChromebookCertRemovalType, ChromebookEnrollmentType } from '@acx-ui/rc/utils'
import { render, screen }                                                     from '@acx-ui/test-utils'

import ChromebookTab from './ChromebookTab'

describe('ChromebookTab', () => {
  it('should render the component with data', () => {
    const data = {
      id: 'idValue',
      name: 'nameValue',
      caType: 'caTypeValue',
      keyLength: 2048,
      algorithm: AlgorithmType.SHA_1,
      chromebook: {
        enrollmentType: ChromebookEnrollmentType.DEVICE,
        certRemovalType: ChromebookCertRemovalType.NONE,
        notifyAppId: 'notifyAppIdValue',
        apiKey: 'apiKeyValue',
        enabled: true,
        type: 'typeValue',
        projectId: 'projectIdValue',
        clientEmail: 'clientEmailValue',
        privateKeyId: 'privateKeyIdValue'
      }
    }
    render(<ChromebookTab data={data} />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Enrollment Type')).toBeInTheDocument()
    expect(screen.getByText('Existing Certificates')).toBeInTheDocument()
    expect(screen.getByText('App ID')).toBeInTheDocument()
    expect(screen.getByText('API Key')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Service Account')).toBeInTheDocument()
    expect(screen.getByText('Email address')).toBeInTheDocument()
    expect(screen.getByText('Key ID')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('Device')).toBeInTheDocument()
    expect(screen.getByText('Do not remove existing certificates.')).toBeInTheDocument()
    expect(screen.getByText('notifyAppIdValue')).toBeInTheDocument()
    expect(screen.getByText('apiKeyValue')).toBeInTheDocument()
    expect(screen.getByText('typeValue')).toBeInTheDocument()
    expect(screen.getByText('projectIdValue')).toBeInTheDocument()
    expect(screen.getByText('clientEmailValue')).toBeInTheDocument()
    expect(screen.getByText('privateKeyIdValue')).toBeInTheDocument()
  })

  it('should render the component without certificate data', () => {
    render(<ChromebookTab data={undefined} />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })
})
