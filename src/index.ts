import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect } from "effect";
import {
	askCommand,
	listCommand,
	showCommand,
	copyCommand,
} from "./commands/index.js";

const main = Command.make("ccask", {}, () => Console.log(`ccask`)).pipe(
	Command.withSubcommands([askCommand, listCommand, showCommand, copyCommand])
);

const cli = Command.run(main, {
	name: "ccask",
	version: "1.0.0",
});

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
