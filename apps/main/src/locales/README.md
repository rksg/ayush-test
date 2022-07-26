This doc is for I18n management for local development  

### Extraction
```sh
npm run extract -- 'src/**/*.ts*' --ignore='**/*.d.ts' --out-file lang/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
```

### Translation Management System (TMS) Integration
```sh
npm run extract -- 'apps/main/src/**/*.ts*' --ignore='**/*.d.ts' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --format formatter.js
```

### Compiling Messages
```sh
npm run compile -- apps/main/src/locales/fr.json --ast --out-file compiled-lang/fr.json
```
