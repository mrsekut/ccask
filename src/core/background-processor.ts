import { spawn } from "child_process";
import { join } from "path";
import { homedir } from "os";
import type { WorkerArgs } from "../types/index.js";
import { addQuestion, sanitizeFilename } from "./question-manager.js";

const ANSWERS_DIR = join(homedir(), ".ccask", "answers");
const WORKER_PATH = "./src/workers/generation-worker.ts";

export const startBackgroundGeneration = async (
	questionTerm: string
): Promise<void> => {
	await addQuestion(questionTerm);

	const filename = sanitizeFilename(questionTerm) + ".md";
	const filepath = join(ANSWERS_DIR, filename);

	console.log(
		`✓ Started generating explanation for "${questionTerm}" in background`
	);
	console.log(`  → Will be saved to ${filepath}`);

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
