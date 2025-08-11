import { ConfigTemplateViewProps }            from '@acx-ui/main/components'
import { ConfigTemplate, ConfigTemplateType } from '@acx-ui/rc/utils'
import { render, screen }                     from '@acx-ui/test-utils'

import { canApplyTemplate, ConfigTemplatePage } from '.'

jest.mock('../ApplyTemplateModal', () => ({
  ApplyTemplateModal: () => <div>ApplyTemplateModal</div>
}))

jest.mock('../ShowDriftsDrawer', () => ({
  ShowDriftsDrawer: () => <div>ShowDriftsDrawer</div>
}))

const mockIsTemplateTypeAllowed = jest.fn()
jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  ConfigTemplateView: (props: ConfigTemplateViewProps) => {
    const { ApplyTemplateView, ShowDriftsView, appliedToColumn } = props
    const mockedTemplate = {
      id: '1',
      name: 'Template 1',
      createdOn: 1690598400000,
      createdBy: 'Author 1',
      appliedOnTenants: ['t1', '1969e24ce9af4348833968096ff6cb47'],
      type: 'NETWORK',
      lastModified: 1690598400000,
      lastApplied: 1690598405000
    } as ConfigTemplate

    return <div>
      <div>ConfigTemplateView</div>
      <ApplyTemplateView setVisible={jest.fn()} selectedTemplate={mockedTemplate} />
      <ShowDriftsView setVisible={jest.fn()} selectedTemplate={mockedTemplate} />
      <div>{appliedToColumn.customRender(mockedTemplate, jest.fn())}</div>
    </div>
  },
  isTemplateTypeAllowed: () => mockIsTemplateTypeAllowed()
}))


describe('ConfigTemplatePage', () => {
  beforeEach(() => {
    mockIsTemplateTypeAllowed.mockReturnValue(true)
  })
  it('should render ConfigTemplatePage correctly', async () => {
    render(<ConfigTemplatePage />)

    expect(screen.getByText('ConfigTemplateView')).toBeVisible()
    expect(screen.getByText('ShowDriftsDrawer')).toBeVisible()
    expect(screen.getByText('ApplyTemplateModal')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
  })

  describe('canApplyTemplate', () => {
    it('should return true for network template with no applied tenants', () => {
      expect(canApplyTemplate({
        id: '1',
        name: 'Template 1',
        createdOn: 1690598400000,
        createdBy: 'Author 1',
        appliedOnTenants: [],
        type: ConfigTemplateType.NETWORK,
        lastModified: 1690598400000,
        lastApplied: 1690598405000
      })).toBe(true)
    })

    it('should return false for network template with applied tenants', () => {
      expect(canApplyTemplate({
        id: '1',
        name: 'Template 1',
        createdOn: 1690598400000,
        createdBy: 'Author 1',
        appliedOnTenants: ['1234'],
        type: ConfigTemplateType.NETWORK,
        lastModified: 1690598400000,
        lastApplied: 1690598405000
      })).toBe(false)
    })

    it('should return true for venue template regardless of applied tenants', () => {
      expect(canApplyTemplate({
        id: '1',
        name: 'Template 1',
        createdOn: 1690598400000,
        createdBy: 'Author 1',
        appliedOnTenants: ['12345'],
        type: ConfigTemplateType.VENUE,
        lastModified: 1690598400000,
        lastApplied: 1690598405000
      })).toBe(true)
    })

    it('should return false when template type is not allowed', () => {
      mockIsTemplateTypeAllowed.mockReturnValue(false)

      expect(canApplyTemplate({
        id: '1',
        name: 'Template 1',
        createdOn: 1690598400000,
        createdBy: 'Author 1',
        appliedOnTenants: [],
        type: ConfigTemplateType.AP_GROUP,
        lastModified: 1690598400000,
        lastApplied: 1690598405000
      })).toBe(false)
    })
  })
})
