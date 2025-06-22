import { spawn } from "child_process";
import { join } from "path";
import type { WorkerArgs } from "../types/index.js";
import { addQuestion, sanitizeFilename } from "./question-manager.js";

const ANSWERS_DIR = "answers";
const WORKER_PATH = "./src/workers/generation-worker.ts";

export const startBackgroundGeneration = async (
	questionTerm: string
): Promise<void> => {
	await addQuestion(questionTerm);

	const filename = sanitizeFilename(questionTerm) + ".md";
	const filepath = join(ANSWERS_DIR, filename);

	console.log(`✓ "${questionTerm}" の解説をバックグラウンドで生成開始`);
	console.log(`  → ${filepath} に保存されます`);

	const workerArgs: WorkerArgs = {
		question: questionTerm,
		filepath,
		claudeCommand: process.env.NODE_ENV === "test" ? "mock-claude" : "claude",
	};

	const worker = spawn(WORKER_PATH, [JSON.stringify(workerArgs)], {
		detached: true,
		stdio: ["ignore", "ignore", "ignore"],
	});

	worker.unref();
};
