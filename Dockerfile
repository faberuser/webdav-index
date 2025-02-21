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
RUN echo 'export const root_dir = "'"$root_dir"'";' > /app/config.tsx && \
    echo 'export const remoteURL = "'"$remoteURL"'";' >> /app/config.tsx && \
    echo 'export const username = "'"$username"'";' >> /app/config.tsx && \
    echo 'export const password = "'"$password"'";' >> /app/config.tsx && \
    echo 'export const title = "'"$title"'";' >> /app/config.tsx && \
    echo 'export const description = "'"$description"'";' >> /app/config.tsx && \
    echo 'export const fuzzy = '"$fuzzy"';' >> /app/config.tsx && \
    echo 'export const cacheRefresh = '"$cacheRefresh"';' >> /app/config.tsx

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Start the application
ENTRYPOINT ["npx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]
