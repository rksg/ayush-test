This doc is for I18n management for local development  

### Extraction
```sh
npx formatjs extract 'apps/*/src/**/*.ts*' --ignore='**/*.d.ts' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' --format simple
 ```

### Compiling Messages
```sh
npx formatjs compile apps/main/src/locales/en-US.json --ast --out-file apps/main/src/locales/compiled/en-US.json
```

### Extract & Compile
```sh
npx formatjs extract 'apps/*/src/**/*.ts*' --ignore='**/*.d.ts' --out-file apps/main/src/locales/en-US.json --flatten --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' && formatjs compile 'apps/main/src/locales/en-US.json' --out-file apps/main/src/locales/compiled/en-US.json
```

### Translation Management System (TMS) Integration
```sh
npm run extract -- 'apps/**/src/**/*.ts*' --ignore='**/*.d.ts' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --format simple
```

