import { Args, Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import {
	getQuestionById,
	getQuestionByTerm,
} from "../core/question-manager.js";

const questionArg = Args.text({ name: "question" }).pipe(
	Args.withDescription("Question ID, term, or path")
);

const jsonOption = Options.boolean("json").pipe(
	Options.withAlias("j"),
	Options.withDescription("Output in JSON format")
);

const showImplementation = (question: string, json: boolean) =>
	Effect.gen(function* () {
		// IDまたは用語で質問を検索
		const questionById = yield* Effect.promise(() => getQuestionById(question));
		const questionByTerm = questionById
			? null
			: yield* Effect.promise(() => getQuestionByTerm(question));

		const targetQuestion = questionById || questionByTerm;

		if (!targetQuestion) {
			yield* Console.error(`Question not found: ${question}`);
			return yield* Effect.fail(new Error("Question not found"));
		}

		if (targetQuestion.status !== "completed" || !targetQuestion.filepath) {
			if (json) {
				yield* Console.log(JSON.stringify(targetQuestion, null, 2));
			} else {
				yield* Console.log(`Question: ${targetQuestion.term}`);
				yield* Console.log(`Status: ${targetQuestion.status}`);
				yield* Console.log("Explanation not generated yet");
			}
			return;
		}

		// ファイルの内容を読み取り
		if (!existsSync(targetQuestion.filepath)) {
			yield* Console.error(
				`File not found: ${targetQuestion.filepath}`
			);
			return yield* Effect.fail(new Error("File not found"));
		}

		const content = yield* Effect.promise(() =>
			readFile(targetQuestion.filepath!, "utf-8")
		);

		if (json) {
			const result = {
				...targetQuestion,
				content,
			};
			yield* Console.log(JSON.stringify(result, null, 2));
		} else {
			yield* Console.log(`Question: ${targetQuestion.term}`);
			yield* Console.log(`File: ${targetQuestion.filepath}`);
			yield* Console.log(`Generated: ${targetQuestion.completedAt}`);
			yield* Console.log("---");
			yield* Console.log(content);
		}
	});

export const showCommand = Command.make(
	"show",
	{ question: questionArg, json: jsonOption },
	({ question, json }) => showImplementation(question, json)
).pipe(Command.withDescription("Display generated explanation"));
