# webdav-index

Interface Indexer for WebDav

## Config

Create a copy of `config-example.tsx` and remove `-example` with filled fields.

Tested using Nextcloud as WebDav provider [link](https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webdav.html#accessing-public-shares-over-webdav)

## Install next.js

```bash
npm install
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

## Docker

Create `.env` with these fields:

```bash
root_dir = "/path/to/directory"
remoteURL = "https://somecoolurl.com"
username = "whoami"
password = ""
title = "Some Cool Title"
description = "Indexer for Some Cool Title"
fuzzy = true
cacheRefresh = 3600
```

Build

```bash
docker-compose build
```

Start

```bash
docker-compose up
```

## Screenshots

![webdav-index-0](https://github.com/user-attachments/assets/53ec1b9b-15c7-4ce8-a6f9-7b97068d7763)

![webdav-index-1](https://github.com/user-attachments/assets/ec2f99b3-5e01-41ce-9ce3-321c012d44c4)
