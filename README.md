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

![Screenshot-1](https://nextcloud.k-clowd.top/apps/files_sharing/publicpreview/ZJycLzxFLcd3TdM?file=/&fileId=783141&x=1366&y=768&a=true&etag=2d8116cd84998288352f60852b6feffe)

![Screenshot-2](https://nextcloud.k-clowd.top/apps/files_sharing/publicpreview/DMWGjnByziWs24K?file=/&fileId=783140&x=1366&y=768&a=true&etag=a78353e4fea824724c102e59b6dc92a2)

### Todo

- [x] Image thumbnail in immediate sub-dir
- [x] Preview .md in path and other text files
- [ ] Back/Forward
- [ ] List view
- [ ] Sort by name, last modified
- [ ] Search
- [ ] Share with path/location
