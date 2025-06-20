import userEvent from '@testing-library/user-event'

import { ConfigTemplateViewProps } from '@acx-ui/main/components'
import { ConfigTemplate }          from '@acx-ui/rc/utils'
import { render, screen }          from '@acx-ui/test-utils'
import { hasAllowedOperations }    from '@acx-ui/user'

import { ConfigTemplatePage, getAppliedToColumn } from '.'

jest.mock('./Templates/AppliedToTenantDrawer', () => ({
  ...jest.requireActual('./Templates/AppliedToTenantDrawer'),
  AppliedToTenantDrawer: () => <div>AppliedToTenantDrawer</div>
}))

jest.mock('./Templates/ApplyTemplateDrawer', () => ({
  ...jest.requireActual('./Templates/ApplyTemplateDrawer'),
  ApplyTemplateDrawer: () => <div>ApplyTemplateDrawer</div>
}))

jest.mock('./Templates/ShowDriftsDrawer', () => ({
  ...jest.requireActual('./Templates/ShowDriftsDrawer'),
  ShowDriftsDrawer: () => <div>ShowDriftsDrawer</div>
}))

const mockedAppliedToCallback = jest.fn()
jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  ConfigTemplateView: (props: ConfigTemplateViewProps) => {
    const { ApplyTemplateView, AppliedToView, ShowDriftsView } = props
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
      <AppliedToView setVisible={jest.fn()} selectedTemplate={mockedTemplate} />
      <ShowDriftsView setVisible={jest.fn()} selectedTemplate={mockedTemplate} />
    </div>
  }
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasAllowedOperations: jest.fn()
}))

describe('ConfigTemplatePage', () => {
  beforeEach(() => {
    (hasAllowedOperations as jest.Mock).mockReturnValue(true)
  })
  afterEach(() => {
    mockedAppliedToCallback.mockClear()
  })
  it('should render ConfigTemplatePage correctly', async () => {
    render(<ConfigTemplatePage />)

    expect(screen.getByText('ConfigTemplateView')).toBeVisible()
    expect(screen.getByText('AppliedToTenantDrawer')).toBeVisible()
    expect(screen.getByText('ApplyTemplateDrawer')).toBeVisible()
    expect(screen.getByText('ShowDriftsDrawer')).toBeVisible()
  })

  describe('getAppliedToColumn', () => {
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

    it('should allow to click appliedToButton', async () => {
      const appliedToColumn = getAppliedToColumn()
      const view = appliedToColumn.customRender(mockedTemplate, mockedAppliedToCallback)

      render(<div>{view}</div>)

      const appliedToButton = screen.getByRole('button', { name: /2/i })
      expect(appliedToButton).toBeVisible()
      await userEvent.click(appliedToButton)
      expect(mockedAppliedToCallback).toHaveBeenCalledTimes(1)
    })

    it('should not allow to click appliedToButton', async () => {
      (hasAllowedOperations as jest.Mock).mockReturnValue(false)

      const appliedToColumn = getAppliedToColumn()
      const view = appliedToColumn.customRender(mockedTemplate, mockedAppliedToCallback)

      render(<div>{view}</div>)

      expect(screen.getByText('2')).toBeVisible()
      expect(screen.queryByRole('button', { name: /2/i })).toBeNull()
    })

    it('should return 0 pure text without link button', async () => {
      const appliedToColumn = getAppliedToColumn()
      const view = appliedToColumn.customRender({
        ...mockedTemplate,
        appliedOnTenants: undefined
      }, mockedAppliedToCallback)

      render(<div>{view}</div>)

      expect(screen.getByText('0')).toBeVisible()
    })
  })
})
