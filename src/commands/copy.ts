import { Args, Command } from "@effect/cli";
import { Console, Effect } from "effect";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { spawn } from "child_process";
import {
	getQuestionById,
	getQuestionByTerm,
} from "../core/question-manager.js";

const questionArg = Args.text({ name: "question" }).pipe(
	Args.withDescription("Question ID, term, or path")
);

const copyToClipboard = (text: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const child = spawn("pbcopy", [], { stdio: ["pipe", "ignore", "ignore"] });

		child.stdin?.write(text);
		child.stdin?.end();

		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`pbcopy failed with code ${code}`));
			}
		});

		child.on("error", reject);
	});
};

const copyImplementation = (question: string) =>
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
			yield* Console.error(
				`Explanation not ready yet: ${targetQuestion.term}`
			);
			return yield* Effect.fail(new Error("Explanation not ready"));
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

		// クリップボードにコピー
		yield* Effect.promise(() => copyToClipboard(content));

		yield* Console.log(
			`✓ Copied explanation for "${targetQuestion.term}" to clipboard`
		);
	});

export const copyCommand = Command.make(
	"copy",
	{ question: questionArg },
	({ question }) => copyImplementation(question)
).pipe(Command.withDescription("Copy generated explanation to clipboard"));
