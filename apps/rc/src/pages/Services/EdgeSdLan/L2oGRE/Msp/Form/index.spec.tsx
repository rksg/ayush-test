import { Form } from 'antd'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { MspEdgeSdLanFormContainer } from '.'

jest.mock('../../Form/EdgeSdLanContextProvider', () => ({
  EdgeSdLanContextProvider: ({ children }: { children: React.ReactNode }) =>
    <div data-testid='EdgeSdLanContextProvider'>{children}</div>
}))

jest.mock('./MspEdgeSdLanContextProvider', () => ({
  MspEdgeSdLanContextProvider: ({ children }: { children: React.ReactNode }) =>
    <div data-testid='MspEdgeSdLanContextProvider'>{children}</div>
}))

jest.mock('../../Form', () => ({
  EdgeSdLanForm: ({ children }: { children: React.ReactNode }) =>
    <div data-testid='EdgeSdLanForm'>{children}</div>
}))

describe('MspEdgeSdLanFormContainer', () => {
  it('should render correctly', () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(
      <MspEdgeSdLanFormContainer
        form={result.current}
        steps={[]}
        onFinish={jest.fn()}
      />
    )

    expect(screen.getByTestId('EdgeSdLanContextProvider')).toBeVisible()
    expect(screen.getByTestId('MspEdgeSdLanContextProvider')).toBeVisible()
    expect(screen.getByTestId('EdgeSdLanForm')).toBeVisible()
  })
})