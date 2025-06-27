import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { homedir } from "os";
import type { Question, QuestionsDB, QuestionStatus } from "./types.js";

const DATA_DIR = join(homedir(), ".ccask");
const QUESTIONS_FILE = join(DATA_DIR, "questions.json");

const ensureDataDir = async (): Promise<void> => {
	if (!existsSync(DATA_DIR)) {
		await mkdir(DATA_DIR, { recursive: true });
	}
};

const loadQuestionsDB = async (): Promise<QuestionsDB> => {
	await ensureDataDir();

	if (!existsSync(QUESTIONS_FILE)) {
		const defaultDB: QuestionsDB = {
			questions: [],
			metadata: {
				version: "1.0.0",
				lastUpdated: new Date().toISOString(),
			},
		};
		await saveQuestionsDB(defaultDB);
		return defaultDB;
	}

	try {
		const content = await readFile(QUESTIONS_FILE, "utf-8");
		return JSON.parse(content) as QuestionsDB;
	} catch (error) {
		throw new Error(`Failed to load questions database: ${error}`);
	}
};

const saveQuestionsDB = async (db: QuestionsDB): Promise<void> => {
	await ensureDataDir();
	db.metadata.lastUpdated = new Date().toISOString();

	try {
		await writeFile(QUESTIONS_FILE, JSON.stringify(db, null, 2), "utf-8");
	} catch (error) {
		throw new Error(`Failed to save questions database: ${error}`);
	}
};

const generateQuestionId = (): string => {
	return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sanitizeFilename = (text: string): string => {
	return text
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "_")
		.toLowerCase()
		.substring(0, 50);
};

export const addQuestion = async (term: string): Promise<Question> => {
	const db = await loadQuestionsDB();

	const question: Question = {
		id: generateQuestionId(),
		term,
		status: "pending",
		createdAt: new Date().toISOString(),
	};

	db.questions.push(question);
	await saveQuestionsDB(db);

	return question;
};

export const updateQuestionStatus = async (
	questionId: string,
	status: QuestionStatus,
	updates: Partial<
		Pick<Question, "startedAt" | "completedAt" | "filepath" | "error">
	> = {}
): Promise<void> => {
	const db = await loadQuestionsDB();
	const question = db.questions.find((q) => q.id === questionId);

	if (!question) {
		throw new Error(`Question with ID ${questionId} not found`);
	}

	question.status = status;

	if (status === "generating" && !question.startedAt) {
		question.startedAt = new Date().toISOString();
	}

	if (status === "completed" && !question.completedAt) {
		question.completedAt = new Date().toISOString();
	}

	Object.assign(question, updates);

	await saveQuestionsDB(db);
};

export const getQuestionByTerm = async (
	term: string
): Promise<Question | undefined> => {
	const db = await loadQuestionsDB();
	return db.questions.find((q) => q.term === term);
};

export const getQuestionById = async (
	id: string
): Promise<Question | undefined> => {
	const db = await loadQuestionsDB();
	return db.questions.find((q) => q.id === id);
};

export const getQuestionsByStatus = async (
	status: QuestionStatus
): Promise<Question[]> => {
	const db = await loadQuestionsDB();
	return db.questions.filter((q) => q.status === status);
};

export const getAllQuestions = async (): Promise<Question[]> => {
	const db = await loadQuestionsDB();
	return db.questions.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
};
