import { Command, Options } from "@effect/cli";
import { Effect } from "effect";
import {
  getAllQuestions,
  getQuestionsByStatus,
} from "../core/question-manager.js";
import { formatQuestion, formatStatus } from "../utils/formatter.js";
import type { QuestionStatus } from "../types/index.js";

const watchOption = Options.boolean("watch").pipe(
  Options.withAlias("w"),
  Options.withDescription("Watch for changes in real-time")
);

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
    watch: watchOption,
    pending: pendingOption,
    recent: recentOption,
    status: statusOption,
  },
  ({ watch, pending, recent, status }) =>
    Effect.gen(function* () {
      const showList = async () => {
        try {
          let questions = await getAllQuestions();

          // Apply filters
          if (pending) {
            questions = questions.filter(q => q.status === "pending");
          } else if (status !== "all") {
            questions = questions.filter(q => q.status === status);
          }

          if (recent) {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            questions = questions.filter(
              q => new Date(q.createdAt) > oneDayAgo
            );
          }

          if (questions.length === 0) {
            console.log("\n質問が見つかりません。");
            return;
          }

          if (watch) {
            console.clear();
          }
          
          console.log(`\n📋 Ask CLI 質問一覧 (${new Date().toLocaleString("ja-JP")})\n`);

          // Show statistics
          const allQuestions = await getAllQuestions();
          const stats = {
            pending: allQuestions.filter(q => q.status === "pending").length,
            generating: allQuestions.filter(q => q.status === "generating").length,
            completed: allQuestions.filter(q => q.status === "completed").length,
            failed: allQuestions.filter(q => q.status === "failed").length,
          };

          console.log("📈 統計:");
          console.log(
            `  待機中: ${stats.pending} | 生成中: ${stats.generating} | 完了: ${stats.completed} | 失敗: ${stats.failed}`
          );
          console.log("");

          // Show active filters
          const filters = [];
          if (pending) filters.push("待機中のみ");
          if (recent) filters.push("24時間以内");
          if (status !== "all") filters.push(`${formatStatus(status as QuestionStatus)}`);
          
          if (filters.length > 0) {
            console.log(`🔍 フィルター: ${filters.join(", ")}\n`);
          }

          // Show questions
          questions.forEach((q, index) => {
            if (index > 0) console.log("---");
            console.log(formatQuestion(q));
          });

          if (watch) {
            console.log("\n👀 監視中... (Ctrl+C で終了)");
          }
        } catch (error) {
          console.error(`エラーが発生しました: ${error}`);
        }
      };

      if (watch) {
        // Initial display
        yield* Effect.promise(async () => await showList());

        // Update periodically
        const interval = setInterval(showList, 2000);

        // Cleanup on exit
        process.on("SIGINT", () => {
          clearInterval(interval);
          console.log("\n\n監視を終了しました。");
          process.exit(0);
        });

        // Keep process alive
        yield* Effect.never;
      } else {
        yield* Effect.promise(() => showList());
      }
    })
);