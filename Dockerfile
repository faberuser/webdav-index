FROM node:22.11-slim

ARG NEXT_PUBLIC_TITLE
ENV NEXT_PUBLIC_TITLE=$NEXT_PUBLIC_TITLE
ARG NEXT_PUBLIC_DESCRIPTION
ENV NEXT_PUBLIC_DESCRIPTION=$NEXT_PUBLIC_DESCRIPTION

WORKDIR /app

COPY . /app

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Start the application
ENTRYPOINT ["npx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]
