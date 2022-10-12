export function mockDOMSize (width: number, height: number) {
  const props = Object.entries({
    offsetWidth: { value: width },
    clientWidth: { value: width },
    offsetHeight: { value: height },
    clientHeight: { value: height }
  })
  for (const [name, { value }] of props) {
    Object.defineProperty(Element.prototype, name, { configurable: true, writable: true, value })
    Object
      .defineProperty(HTMLElement.prototype, name, { configurable: true, writable: true, value })
  }
}
