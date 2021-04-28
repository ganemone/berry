import {PortablePath, xfs} from '@yarnpkg/fslib';

const lockfile100 = `
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


no-deps@*:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/no-deps/-/no-deps-1.0.0.tgz#39453512f8241e2d20307975e8d9eb6314f7bf61"
  integrity sha1-OUU1EvgkHi0gMHl16NnrYxT3v2E=
`.replace(/^\n+/g, ``);

const lockfile200 = `
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


no-deps@*:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/no-deps/-/no-deps-2.0.0.tgz#39453512f8241e2d20307975e8d9eb6314f7bf62"
  integrity sha1-OUU1EvgkHi0gMHl16NnrYxT3v2E=
`.replace(/^\n+/g, ``);

describe(`Legacy tests`, () => {
  test(
    `it should import lock entries from v1 lockfiles (resolves to 1.0.0)`,
    makeTemporaryEnv(
      {
        dependencies: {[`no-deps`]: `*`},
      },
      async ({path, run, source}) => {
        await xfs.writeFilePromise(`${path}/yarn.lock` as PortablePath, lockfile100);
        await run(`install`);

        await expect(source(`require('no-deps')`)).resolves.toMatchObject({
          name: `no-deps`,
          version: `1.0.0`,
        });
      },
    )
  );

  test(
    `it should import lock entries from v1 lockfiles (resolves to 2.0.0)`,
    makeTemporaryEnv(
      {
        dependencies: {[`no-deps`]: `*`},
      },
      async ({path, run, source}) => {
        await xfs.writeFilePromise(`${path}/yarn.lock` as PortablePath, lockfile200);
        await run(`install`);

        await expect(source(`require('no-deps')`)).resolves.toMatchObject({
          name: `no-deps`,
          version: `2.0.0`,
        });
      },
    )
  );

  test(
    `it should import lock entries from v1 lockfiles preserving the alias`,
    makeTemporaryEnv(
      {
        dependencies: {[`nodeps`]: `npm:no-deps@*`},
      },
      async ({path, run, source}) => {
        await xfs.writeFilePromise(
          `${path}/yarn.lock` as PortablePath,
          `
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


"nodeps@npm:no-deps@*":
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/no-deps/-/no-deps-2.0.0.tgz#39453512f8241e2d20307975e8d9eb6314f7bf62"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
`.replace(/^\n+/g, ``)
        );
        await run(`install`);

        await expect(source(`require('nodeps')`)).resolves.toMatchObject({
          name: `no-deps`,
          version: `2.0.0`,
        });
      },
    )
  );

  test(
    `it should import lock entries from v1 lockfiles where the forward slash after the scope is encoded`,
    makeTemporaryEnv(
      {
        dependencies: {[`@types/no-deps`]: `*`},
      },
      async ({path, run, source}) => {
        await xfs.writeFilePromise(
          `${path}/yarn.lock` as PortablePath,
          `
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


"@types/no-deps@*":
  version "1.0.0"
  resolved "https://foo.bar/@types%2fno-deps/-/no-deps-1.0.0.tgz"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
`.replace(/^\n+/g, ``)
        );
        await run(`install`);

        await expect(source(`require('@types/no-deps')`)).resolves.toMatchObject({
          name: `@types/no-deps`,
          version: `1.0.0`,
        });
      },
    )
  );
});
