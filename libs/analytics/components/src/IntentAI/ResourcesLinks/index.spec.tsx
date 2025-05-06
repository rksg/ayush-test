import { get }            from '@acx-ui/config'
import { screen, render } from '@acx-ui/test-utils'

import { AiFeatures } from '../config'

import ResourcesLinks from '.'

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue(true)
}))

const AiFeaturesWithLinks = [AiFeatures.AIOps, AiFeatures.EquiFlex, AiFeatures.RRM]

describe('ResourcesLinks', () => {
  it.each(AiFeaturesWithLinks)(
    'Should render links for %s in RAI',
    (feature) => {
      mockGet.mockReturnValue(true)
      render(<ResourcesLinks feature={feature} />)

      expect(
        screen.getByText('RUCKUS AI - AI Operations Demo')
      ).toBeInTheDocument()
      expect(
        screen.getByText('RUCKUS AI - AI Operations Documentation')
      ).toBeInTheDocument()
    }
  )

  it.each(AiFeaturesWithLinks)(
    'Should render links for %s in R1',
    (feature) => {
      mockGet.mockReturnValue(false)
      render(<ResourcesLinks feature={feature} />)

      expect(
        screen.getByText('RUCKUS One - AI Operations Demo')
      ).toBeInTheDocument()
      expect(
        screen.getByText('RUCKUS One - AI Operations Documentation')
      ).toBeInTheDocument()
    }
  )

  it.each(Object.values(AiFeatures).filter(
    (feature) => !AiFeaturesWithLinks.includes(feature)
  ))('Should not render links for %s in RAI', (feature) => {
    render(<ResourcesLinks feature={feature} />)
    expect(
      screen.queryByText('RUCKUS AI - AI Operations Demo')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('RUCKUS AI - AI Operations Documentation')
    ).not.toBeInTheDocument()
  })

  it.each(Object.values(AiFeatures).filter(
    (feature) => !AiFeaturesWithLinks.includes(feature)
  ))('Should not render links for %s in R1', (feature) => {
    render(<ResourcesLinks feature={feature} />)
    expect(
      screen.queryByText('RUCKUS One - AI Operations Demo')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('RUCKUS One - AI Operations Documentation')
    ).not.toBeInTheDocument()
  })
})
