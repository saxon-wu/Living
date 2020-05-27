# Living

> ### [Living](https://github.com/saxon-wu/Living) is a full-stack TypeScript solution, and example.
#### 😃Server side: NestJS + Typeorm + PostgreSQL + ant-design-pro
#### 😃Client side: Next.js + TailwindCSS
#### 😃Mobile side: React Native(Todo)

----------

### Translations [中文](README_zh_CN.md)

----------

## 🔥 Features

### Authorization module
- [✔] Sign in
- [✔] Sign up

### Arcile module
- [✔] Create article
- [✔] Update article
- [✔] Favorite articles
- [✔] Give the article a like

### Comment module
- [✔] Comment articles
- [✔] Reply to any comments
- [✔] Reply to any "reply"
- [✔] Give the comment a like

### File module
- [✔] Upload a sigle file
- [✔] Upload image with url
- [✔] Automatically generate a placeholder (avatar, cover, not found...)
- [✔] Dynamic image resizing

----------

## 🚀 Getting started

Clone the repository

    git clone https://github.com/saxon-wu/Living.git

Switch to the repo folder

    cd Living/nestjs

Copy file

    cp .example.env .development.env

    cp example.docker-compose.yml dev.yml

Set up configuration

    vim .development.env
    vim dev.yml

Starting services
    
    docker-compose -f dev.yml --env-file .development.env up -d


