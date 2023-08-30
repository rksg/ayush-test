import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { HelpButton } from './'

describe('HelpButton', () => {
  beforeEach(() => jest.resetModules())
  it('should render properly', async () => {
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByRole('menuitem', { name: 'Documentation' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'How-To Videos' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'License Information' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Contact Support' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Open a case' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Privacy' })).toBeInTheDocument()
  })
  it('should open new window for Documentation', async () => {
    const spy = jest.spyOn(window, 'open')
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Documentation' }))
    expect(spy).toBeCalledWith(undefined, '_blank')
  })
  it('should open new window for How-To Videos', async () => {
    const spy = jest.spyOn(window, 'open')
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'How-To Videos' }))
    expect(spy).toBeCalledWith(
      'https://www.youtube.com/playlist?list=PLySwoo7u9-KKF7o-kkNIgCWneuT0RTmJi', '_blank')
  })
  it('should open new window for License Information', async () => {
    const spy = jest.spyOn(window, 'open')
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'License Information' }))
    expect(spy).toBeCalledWith(
      'http://docs.cloud.ruckuswireless.com/RALicensingGuide/mapfile/index.html',
      '_blank'
    )
  })
  it('should open new window for Contact Support', async () => {
    const spy = jest.spyOn(window, 'open')
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Contact Support' }))
    expect(spy).toBeCalledWith('https://support.ruckuswireless.com/contact-us', '_blank')
  })
  it('should open new window for Open a case', async () => {
    const spy = jest.spyOn(window, 'open')
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Open a case' }))
    expect(spy).toBeCalledWith('https://support.ruckuswireless.com/cases/new', '_blank')
  })
  it('should open new window for Privacy', async () => {
    const spy = jest.spyOn(window, 'open')
    render(<Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Privacy' }))
    expect(spy).toBeCalledWith('https://support.ruckuswireless.com/ruckus-cloud-privacy-policy',
      '_blank')
  })
})