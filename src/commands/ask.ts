import { Args, Command } from "@effect/cli";
import { Effect } from "effect";
import { startBackgroundGeneration } from "../core/background-processor.js";

const questionArg = Args.text({ name: "question" });

export const askCommand = Command.make(
	"ask",
	{ question: questionArg },
	({ question }) =>
		Effect.gen(function* () {
			yield* Effect.promise(
				async () => await startBackgroundGeneration(question)
			);
		})
);
