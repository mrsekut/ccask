#!/usr/bin/env bun

import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect } from "effect";
import { addCommand, listCommand } from "./commands/index.js";

const main = Command.make("ask", {}, () => Console.log(`Ask CLI - 技術用語の解説を生成します`)).pipe(
	Command.withSubcommands([addCommand, listCommand])
);

const cli = Command.run(main, {
	name: "Ask CLI",
	version: "0.1.0",
});

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
