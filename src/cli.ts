import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect } from "effect";
import { addCommand } from "./commands/index.js";

const main = Command.make("ask", {}, () => Console.log(`Running 'ask'`)).pipe(
	Command.withSubcommands([addCommand])
);

const cli = Command.run(main, {
	name: "Ask CLI",
	version: "0.1.0",
});

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
