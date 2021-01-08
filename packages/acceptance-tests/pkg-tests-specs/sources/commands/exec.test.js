const {xfs} = require(`@yarnpkg/fslib`);

describe(`Commands`, () => {
  describe(`exec`, () => {
    test(
      `it should preserve the exit code`,
      makeTemporaryEnv({}, async ({path, run, source}) => {
        await run(`install`);
        await expect(run(`exec`, `run`, `foo`)).rejects.toMatchObject({
          code: 1,
          stdout: expect.stringContaining(`Usage Error: Couldn't find a script named "foo"`),
        });
      })
    );

    test(
      `it should end child process on SIGTERM`,
      makeTemporaryEnv({}, async ({path, run, source}) => {
        await xfs.writeFilePromise(`${path}/test.sh`, ([
          `yarn node -e "console.log('Testing exec SIGTERM'); setTimeout(() => {}, 10000)" &`,
          `sleep 1`,
          `ps | grep -v "grep" | grep -q "Testing exec SIGTERM" || exit 1`, // check if it was started properly
          `kill $!`,
          `sleep 1`,
          `if ps | grep -v "grep" | grep -q "Testing exec SIGTERM"`,
          `then`,
          `  echo "[FAIL] still running"; exit 1`,
          `else`,
          `  echo "[PASS] ok"; exit 0`,
          `fi`,
        ]).join(`\n`));

        await expect(run(`exec`, `bash`, `test.sh`)).resolves.toMatchObject({
          code: 0,
          stdout: expect.stringContaining(`PASS`),
        });
      })
    );

    test(
      `it should not expand glob patterns`,
      makeTemporaryEnv({}, async ({path, run, source}) => {
        await run(`install`);

        await xfs.writeFilePromise(`${path}/echo.js`, `process.stdout.write(process.argv[2])`);

        await expect(run(`exec`, `node`, `echo.js`, `*.js`)).resolves.toMatchObject({
          code: 0,
          stdout: expect.stringContaining(`*.js`),
        });
      })
    );
  });
});
