# Living

> ### [Living](https://github.com/saxon-wu/Living) 是一个全栈的解决方案,和示例。
#### 😃服务端: NestJS + Typeorm + PostgreSQL + ant-design-pro
#### 😃客户端: Next.js + TailwindCSS
#### 😃移动端: React Native

----------

### Translations [English](README.md)

----------

## 🔥 Features

### 授权模块
- [✔] 登录
- [✔] 注册

### 文章模块
- [✔] 发布文章
- [✔] 更新文章
- [✔] 收藏文章
- [✔] 为文章点赞

### 评论模块
- [✔] 评论文章
- [✔] 回复评论
- [✔] 回复“回复”
- [✔] 为评论点赞

### 文件模块
- [✔] 上传单文件
- [✔] 传入外链url上传图片
- [✔] 自动生成占位图(头像，封面，not found...)
- [✔] 动态生成指定大小的图片并静态化

----------

## 🚀 Getting started

克隆存储库

    git clone https://github.com/saxon-wu/Living.git

切换到存储库文件夹

    cd Living/nestjs

复制文件

    cp .example.env .development.env

    cp example.docker-compose.yml dev.yml

设置配置

    vim .development.env
    vim dev.yml

启动服务
    
    docker-compose -f dev.yml --env-file .development.env up -d
