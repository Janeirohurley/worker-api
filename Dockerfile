# ---- STAGE 1: Build ----
FROM node:18-bullseye AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm run build


# ---- STAGE 2: Production ----
FROM node:18-bullseye

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["pnpm", "start"]
