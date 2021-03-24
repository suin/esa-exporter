import { Client, createClient, Member, Post } from "@suin/esa-api";

export async function* exportAll({
  team,
  token,
  logger = muteLogger,
}: ExportAllOptions): AsyncIterable<Entity> {
  const client = createClient({ team, token });
  logger(`main: getting all members from team: ${team}`);
  for await (const member of getAllMembers({ client, logger })) {
    yield { $type: "member", ...member };
  }
  logger(`main: all members has been got.`);

  logger(`main: getting all posts from team: ${team}...`);
  for await (const post of getAllPosts({ client, logger })) {
    yield { $type: "post", ...post };
  }
  logger(`main: all posts has been got.`);
}

export type ExportAllOptions = {
  readonly team: string;
  readonly token: string;
  readonly logger?: Logger;
};

export type Entity =
  | ({ $type: "member" } & Member)
  | ({ $type: "post" } & Post);

export { Member, Post };

async function* getAllMembers({
  client,
  logger,
}: {
  readonly client: Client;
  readonly logger: Logger;
}): AsyncIterable<Member> {
  yield* getAllEntities({
    logger: (message) => logger(`members: ${message}`),
    getPage: async (page) =>
      client
        .getMembers({ per_page: 100, page, sort: "joined", order: "asc" })
        .then(({ members, next_page }) => ({ entities: members, next_page })),
  });
}

async function* getAllPosts({
  client,
  logger,
}: {
  readonly client: Client;
  readonly logger: Logger;
}): AsyncIterable<Post> {
  yield* getAllEntities({
    logger: (message) => logger(`posts: ${message}`),
    getPage: async (page) =>
      await client
        .getPosts({
          per_page: 100,
          page,
          sort: "number",
          order: "asc",
          include: ["comments", "comments.stargazers", "stargazers"],
        })
        .then(({ posts, next_page }) => ({ entities: posts, next_page })),
  });
}

async function* getAllEntities<T>({
  getPage,
  logger: log,
}: {
  readonly getPage: (
    page: number
  ) => Promise<{
    entities: Iterable<T> & { length: number };
    next_page: number | null;
  }>;
  readonly logger: Logger;
}): AsyncIterable<T> {
  let page = 1;
  let waitSeconds = 1;
  while (true) {
    log(`getting page ${page}...`);
    try {
      const { entities, next_page } = await getPage(page);
      log(`got ${entities.length} entities.`);
      yield* entities;
      if (typeof next_page !== "number") {
        return;
      }
      page = next_page;
    } catch (e) {
      if (e?.response?.status === ratelimitReachedErrorCode) {
        log(`ratelimit reached, waits ${waitSeconds} seconds...`);
        // cooling down
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        waitSeconds *= 2;
      } else {
        throw e;
      }
    }
  }
}

const ratelimitReachedErrorCode = 429;

type Logger = (message: string, ...data: any[]) => void;

const muteLogger = () => {};
