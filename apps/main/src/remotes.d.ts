// Declare your remote Modules here
// Example declare module 'about/Module';

declare module 'rc-wifi/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
declare module 'rc-wifi/Widgets' {
  // refer to modulefederation.config.js for correct mapping
  function Widgets (props: { name: string }): React.ReactElement
  export = Widgets
}
