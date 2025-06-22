import { Args, Command } from "@effect/cli";
import { Effect } from "effect";
import { startBackgroundGeneration } from "../core/background-processor.js";

const questionArg = Args.text({ name: "question" });

export const addCommand = Command.make(
	"add",
	{ question: questionArg },
	({ question }) =>
		Effect.gen(function* () {
			yield* Effect.promise(
				async () => await startBackgroundGeneration(question)
			);
		})
);
