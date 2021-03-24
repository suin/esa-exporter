# @suin/esa-exporter

esa.io API から全データをエクスポートするライブラリ。

esa.io のエクスポート機能はマークダウンファイルがダウンロードできるだけで、他の情報が入ってこないためこれを開発しました。

## 特徴

- エクスポートに対応しているデータ
  - メンバー
  - 投稿
    - コメント
    - stargazers

## インストール

```bash
yarn add @suin/esa-exporter
# or
npm install @suin/esa-exporter
```

## 使い方

基本的な用法:

```typescript
import { exportAll, Entity } from "@suin/esa-exporter";

(async () => {
  const team = process.env.ESA_TEAM;
  const token = process.env.ESA_TOKEN;
  const entities: Entity[] = [];

  for await (const entity of exportAll({ team, token })) {
    entities.push(entity);
  }

  console.log(entities);
})();
```

出力例:

```javascript
[
  {
    $type: "member",
    myself: true,
    name: "Taro Tanaka",
    screen_name: "tanaka",
    icon:
      "https://img.esa.io/uploads/production/users/1/icon/thumb_m_********.png",
    role: "owner",
    posts_count: 222,
    joined_at: "2014-07-01T08:10:55+09:00",
    last_accessed_at: "2019-12-27T16:23:23+09:00",
    email: "tanaka@example.com",
  },
  {
    $type: "member",
    myself: false,
    name: "Hanako Sato",
    screen_name: "sato",
    icon:
      "https://img.esa.io/uploads/production/users/2/icon/thumb_m_********.jpg",
    role: "owner",
    posts_count: 111,
    joined_at: "2014-07-01T08:19:26+09:00",
    last_accessed_at: "2019-08-13T18:07:24+09:00",
    email: "sato@example.com",
  },
  {
    $type: "post",
    number: 1,
    name: "esa APIの使い方",
    full_name: "日報/2015/05/09/esa APIの使い方 #api #dev",
    wip: true,
    body_md: "...",
    body_html: "...",
    created_at: "2015-05-09T11:54:50+09:00",
    message: "初稿です！",
    url: "https://example.esa.io/posts/1",
    updated_at: "2015-05-09T11:54:51+09:00",
    tags: ["api", "dev"],
    category: "日報/2015/05/09",
    revision_number: 1,
    created_by: {
      myself: true,
      name: "Taro Tanaka",
      screen_name: "tanaka",
      icon:
        "https://img.esa.io/uploads/production/users/1/icon/thumb_m_********.png",
    },
    updated_by: {
      myself: true,
      name: "Taro Tanaka",
      screen_name: "tanaka",
      icon:
        "https://img.esa.io/uploads/production/users/1/icon/thumb_m_********.png",
    },
  },
];
```

`exportAll`は様々なエンティティをごちゃまぜで返してくるので、 エンティティ種別ごとに何らかの処理をする必要がある場合は、`Entity[$type]`で分岐処理を書いてください:

```typescript
import { exportAll, Member, Post } from "@suin/esa-exporter";

(async () => {
  const team = process.env.ESA_TEAM;
  const token = process.env.ESA_TOKEN;

  const members: Member[] = [];
  const posts: Post[] = [];

  for await (const entity of exportAll({ team, token })) {
    switch (entity.$type) {
      case "member":
        members.push(entity);
        break;
      case "post":
        posts.push(posts);
        break;
    }
  }
})();
```

## API リファレンス

https://suin.github.io/esa-exporter/
