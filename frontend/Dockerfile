# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nx build frontend --configuration=production

# Stage 2: Serve
FROM nginx:alpine
# Copy built files from Nx dist folder to Nginx
COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80