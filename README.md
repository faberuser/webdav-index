# webdav-index
Interface Indexer for WebDav

## Config

Create a copy of `config-example.tsx` and remove `-example` with filled fields.

Tested using Nextcloud as WebDav provider [link](https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webdav.html#accessing-public-shares-over-webdav)

**Important: Public account/share dir is recommended because download URL will expose your credentials**

## Install next.js

```bash
npm install next
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying

Build
```bash
npm run build
```

Start
```bash
npm run start
```

## Screenshots

![webdav-index-0](https://github.com/user-attachments/assets/fabe8c2b-5c0e-49fe-af31-899bde83d155)

![webdav-index-1](https://github.com/user-attachments/assets/a2581389-acab-4cf0-8190-04685712de3c)

### Todo

- [x] Image thumbnail in immediate sub-dir
- [x] Preview .md in path and other text files
- [ ] Back/Forward
- [ ] List view
- [ ] Sort by name, last modified
- [ ] Search
- [ ] Share with path/location
