#!/usr/bin/env bun

import { spawn } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { existsSync } from "fs";
import type { WorkerArgs } from "../types/index.js";
import {
	updateQuestionStatus,
	getQuestionByTerm,
} from "../core/question-manager.js";

type ProcessedWorkerArgs = WorkerArgs & {
	questionId?: string;
};

const logMessage = async (message: string): Promise<void> => {
	const logEntry = `[${new Date().toISOString()}] ${message}\n`;
	try {
		await writeFile("ccask.log", logEntry, { flag: "a" });
	} catch (error) {
		console.error(`Failed to write log: ${error}`);
	}
};

const ensureAnswersDir = async (filepath: string): Promise<void> => {
	const dir = dirname(filepath);
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true });
	}
};

const updateQuestionFromWorker = async (
	term: string,
	status: "generating" | "completed" | "failed",
	updates: any = {}
): Promise<void> => {
	try {
		const question = await getQuestionByTerm(term);
		if (question) {
			await updateQuestionStatus(question.id, status, updates);
		}
	} catch (error) {
		await logMessage(`Failed to update question status: ${error}`);
	}
};

const generateExplanation = async (
	args: ProcessedWorkerArgs
): Promise<void> => {
	const { question, filepath, claudeCommand = "claude" } = args;

	if (!question || !filepath) {
		await logMessage("Missing required arguments: question and filepath");
		process.exit(1);
	}

	await logMessage(`Starting generation for: ${question}`);
	await updateQuestionFromWorker(question, "generating", {
		startedAt: new Date().toISOString(),
	});
	await ensureAnswersDir(filepath);

	const child = spawn(
		claudeCommand,
		[
			"-p",
			`${question}について詳しく解説してください。専門用語も含めて分かりやすく説明してください。`,
		],
		{
			stdio: ["ignore", "pipe", "pipe"],
		}
	);

	const chunks: string[] = [];
	const errorChunks: string[] = [];

	child.stdout?.on("data", (data) => {
		chunks.push(data.toString());
	});

	child.stderr?.on("data", (data) => {
		errorChunks.push(data.toString());
	});

	child.on("close", async (code) => {
		const output = chunks.join("");
		const error = errorChunks.join("");

		if (code === 0 && output.trim()) {
			try {
				await writeFile(filepath, output);
				await updateQuestionFromWorker(question, "completed", {
					completedAt: new Date().toISOString(),
					filepath,
				});
				await logMessage(
					`Successfully generated explanation for: ${question} -> ${filepath}`
				);
			} catch (writeError) {
				await updateQuestionFromWorker(question, "failed", {
					error: `Failed to write file: ${writeError}`,
				});
				await logMessage(`Failed to write file for ${question}: ${writeError}`);
			}
		} else {
			const errorMsg = `Exit code: ${code}, Error: ${error}`;
			await updateQuestionFromWorker(question, "failed", { error: errorMsg });
			await logMessage(
				`Failed to generate explanation for ${question}. ${errorMsg}`
			);
		}
	});

	child.on("error", async (err) => {
		const errorMsg = `Process error: ${err.message}`;
		await updateQuestionFromWorker(question, "failed", { error: errorMsg });
		await logMessage(`Process error for ${question}: ${err.message}`);
	});
};

if (import.meta.main) {
	try {
		const argsString = process.argv[2];
		if (!argsString) {
			console.error("No arguments provided");
			process.exit(1);
		}

		const args: ProcessedWorkerArgs = JSON.parse(argsString);
		generateExplanation(args).catch((error) => {
			console.error(`Worker error: ${error}`);
			process.exit(1);
		});
	} catch (parseError) {
		console.error(`Failed to parse arguments: ${parseError}`);
		process.exit(1);
	}
}
