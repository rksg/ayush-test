import React from 'react'

import { EdgeStatusEnum } from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import { EdgeStatusLight } from './EdgeStatusLight'


describe('EdgeStatusLight component', () => {

  it('renders with correct color and text for never contacted cloud', async () => {
    render(<EdgeStatusLight data={EdgeStatusEnum.NEVER_CONTACTED_CLOUD} showText={true} />)
    const statusLight = await screen.findByText('Never contacted cloud')
    expect(statusLight).toHaveStyle('background-color: var(--acx-neutrals-50)')
    expect(statusLight).toBeVisible()
  })

  it('renders with correct color and text for needs port config', async () => {
    render(<EdgeStatusLight data={EdgeStatusEnum.NEEDS_CONFIG} showText={true} />)
    const statusLight = await screen.findByText('Needs port config')
    expect(statusLight).toHaveStyle('background-color: var(--acx-neutrals-50)')
    expect(statusLight).toBeVisible()
  })

  it('renders with correct color and text for applying firmware', async () => {
    render(<EdgeStatusLight data={EdgeStatusEnum.APPLYING_FIRMWARE} showText={true} />)
    const statusLight = await screen.findByText('Applying firmware')
    expect(statusLight).toHaveStyle('background-color: var(--acx-semantics-yellow-50)')
    expect(statusLight).toBeVisible()
  })

  it('renders with correct color and text for configuration update failed', async () => {
    render(<EdgeStatusLight data={EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED} showText={true} />)
    const statusLight = await screen.findByText('Configuration update failed')
    expect(statusLight).toHaveStyle('background-color: var(--acx-semantics-red-50)')
    expect(statusLight).toBeVisible()
  })

  it('renders with showText prop set to true', async () => {
    render(<EdgeStatusLight data={EdgeStatusEnum.OPERATIONAL} showText={true} />)
    expect(await screen.findByText('Operational')).toBeVisible()
  })

  it('renders with showText prop set to false', async () => {
    render(<EdgeStatusLight data={EdgeStatusEnum.OPERATIONAL} showText={false} />)
    expect(screen.queryByText('Operational')).toBeNull()
  })
})