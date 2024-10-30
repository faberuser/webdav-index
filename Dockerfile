FROM node:22.11-slim

ARG root_dir
ARG remoteURL
ARG username
ARG password
ARG title
ARG description
ARG fuzzy
ARG cacheRefresh

WORKDIR /app

COPY . /app

# Generate config.tsx file
RUN /bin/sh -c "echo '' > /app/config.tsx && \
    for VAR in \$(printenv | grep 'REACT_APP_' | cut -d= -f1); do \
    VALUE=\${\$VAR}; \
    echo 'export const \$VAR = '\''\$VALUE'\'';' >> /app/config.tsx; \
    done"

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Start the application
ENTRYPOINT ["npx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]
