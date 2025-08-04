
import { rest } from 'msw'

import { CertificateUrls }                                       from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { scepKeys } from '../__tests__/fixtures'

import ScepTable from './ScepTable'



describe('ScepTable', () => {
  it('should render the component with data', async () => {
    mockServer.use(
      rest.get(
        CertificateUrls.getCertificateTemplateScepKeys.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(scepKeys))
      )
    )
    render(<Provider><ScepTable templateId='123'></ScepTable></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getAllByText('Name')).toHaveLength(2)
    expect(screen.getByText('dddd')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Expired')).toBeInTheDocument()
    expect(screen.getByText('Access')).toBeInTheDocument()
    expect(screen.getByText('Restricted')).toBeInTheDocument()
    expect(screen.getByText('SCEP Enroll URL')).toBeInTheDocument()
    expect(screen.getByText('Challenge Password')).toBeInTheDocument()
  })

})