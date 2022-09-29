function descriptor (property: string) {
  return Object.getOwnPropertyDescriptor(HTMLElement.prototype, property)
}

export function mockDOMWidth (width = 280, height = 280) {
  const props = Object.entries({
    offsetWidth: { descriptor: descriptor('offsetWidth'), value: width },
    clientWidth: { descriptor: descriptor('clientWidth'), value: width },
    offsetHeight: { descriptor: descriptor('offsetHeight'), value: height },
    clientHeight: { descriptor: descriptor('clientHeight'), value: height }
  })

  beforeAll(() => {
    for (const [property, { value }] of props) {
      Object.defineProperty(HTMLElement.prototype, property, { configurable: true, value })
    }
  })
  afterAll(() => {
    const defaultDescriptor = { configurable: true, value: 0 }
    for (const [property, { descriptor }] of props) {
      Object.defineProperty(HTMLElement.prototype, property, descriptor ?? defaultDescriptor)
    }
  })
}
