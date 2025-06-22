import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";
import { getAllQuestions } from "../core/question-manager.js";
import { formatQuestion, formatStatus } from "../utils/formatter.js";
import type { Question, QuestionStatus } from "../types/index.js";

const pendingOption = Options.boolean("pending").pipe(
	Options.withAlias("p"),
	Options.withDescription("Show only pending questions")
);

const recentOption = Options.boolean("recent").pipe(
	Options.withAlias("r"),
	Options.withDescription("Show only recent questions (last 24 hours)")
);

const statusOption = Options.choice("status", [
	"all",
	"pending",
	"generating",
	"completed",
	"failed",
] as const).pipe(
	Options.withAlias("s"),
	Options.withDescription("Filter by status"),
	Options.withDefault("all")
);

export const listCommand = Command.make(
	"list",
	{
		pending: pendingOption,
		recent: recentOption,
		status: statusOption,
	},
	({ pending, recent, status }) =>
		Effect.gen(function* () {
			const questions = yield* Effect.promise(() => getAllQuestions());

			const applyStatusFilter = (
				questions: Question[],
				pending: boolean,
				status: string
			): Question[] => {
				if (pending) return questions.filter((q) => q.status === "pending");
				if (status !== "all")
					return questions.filter((q) => q.status === status);
				return questions;
			};

			const applyRecentFilter = (
				questions: Question[],
				recent: boolean
			): Question[] => {
				if (!recent) return questions;
				const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
				return questions.filter((q) => new Date(q.createdAt) > oneDayAgo);
			};

			const calculateStats = (questions: Question[]) => ({
				pending: questions.filter((q) => q.status === "pending").length,
				generating: questions.filter((q) => q.status === "generating").length,
				completed: questions.filter((q) => q.status === "completed").length,
				failed: questions.filter((q) => q.status === "failed").length,
			});

			const buildFilters = (
				pending: boolean,
				recent: boolean,
				status: string
			): string[] => [
				...(pending ? ["Pending only"] : []),
				...(recent ? ["Last 24 hours"] : []),
				...(status !== "all" ? [formatStatus(status as QuestionStatus)] : []),
			];

			const filteredQuestions = applyRecentFilter(
				applyStatusFilter(questions, pending, status),
				recent
			);

			if (filteredQuestions.length === 0) {
				return yield* Console.log("\nNo questions found.");
			}

			const stats = calculateStats(questions);
			const filters = buildFilters(pending, recent, status);

			yield* Console.log(
				`\n📋 aiq - Question List (${new Date().toLocaleString()})\n`
			);
			yield* Console.log("📈 Statistics:");
			yield* Console.log(
				`  Pending: ${stats.pending} | Generating: ${stats.generating} | Completed: ${stats.completed} | Failed: ${stats.failed}`
			);
			yield* Console.log("");

			if (filters.length > 0) {
				yield* Console.log(`🔍 Filters: ${filters.join(", ")}\n`);
			}

			for (const [index, question] of filteredQuestions.entries()) {
				if (index > 0) yield* Console.log("---");
				yield* Console.log(formatQuestion(question));
			}
		})
);
