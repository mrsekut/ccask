import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { askCommand } from "./commands/ask.js";

const cli = Command.run(askCommand, {
	name: "Ask CLI",
	version: "0.1.0",
});

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
