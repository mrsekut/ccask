import { Args, Command } from "@effect/cli";
import { Effect } from "effect";
import { startBackgroundGeneration } from "../core/background-processor.js";

const questionArg = Args.text({ name: "question" }).pipe(
	Args.withDescription("Technical term to ask AI about")
);

export const askCommand = Command.make(
	"ask",
	{ question: questionArg },
	({ question }) =>
		Effect.gen(function* () {
			yield* Effect.promise(() => startBackgroundGeneration(question));
		})
).pipe(
	Command.withDescription("Ask a new question and start generating explanation")
);
