FROM node:22.11-slim

WORKDIR /app

COPY . /app

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Start the application
ENTRYPOINT ["npx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]
