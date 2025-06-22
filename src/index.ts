import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect } from "effect";
import {
	askCommand,
	listCommand,
	showCommand,
	copyCommand,
} from "./commands/index.js";

const main = Command.make("aiq", {}, () => Console.log(`aiq`)).pipe(
	Command.withSubcommands([askCommand, listCommand, showCommand, copyCommand])
);

const cli = Command.run(main, {
	name: "aiq",
	version: "1.0.0",
});

const mainCli = (argv: string[]) => {
	cli(argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
};
