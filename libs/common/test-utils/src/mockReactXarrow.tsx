const mockReactXarrow = () =>
// Mock module because the xarrow component will get the error: '_c.getTotalLength is not a function' when testing
  jest.mock('react-xarrows', () => {
    return {
      __esModule: true,
      default: () => <span />,
      useXarrow: () => null
    }
  })

export { mockReactXarrow }
