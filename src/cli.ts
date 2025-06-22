#!/usr/bin/env bun

import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { askCommand, statusCommand } from "./commands/index.js";

// サブコマンドを持つルートコマンドを作成
const mainCommand = askCommand.pipe(
  Command.withSubcommands([
    ["status", statusCommand],
  ])
);

const cli = Command.run(mainCommand, {
  name: "Ask CLI",
  version: "0.1.0",
});

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
