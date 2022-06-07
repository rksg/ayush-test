export function mockAutoSizer (width = 280, height = 280) {
  const originalOffsetHeight =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight') as PropertyDescriptor
  const originalOffsetWidth =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth') as PropertyDescriptor
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype,
      'offsetWidth', { configurable: true, value: width })
    Object.defineProperty(HTMLElement.prototype,
      'offsetHeight', { configurable: true, value: height })
  })
  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
  })
}
