import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";
import { getAllQuestions, getQuestionsByStatus } from "../core/question-manager.js";
import { formatQuestion, formatStatus } from "../utils/formatter.js";
import type { QuestionStatus } from "../types/index.js";

const watchOption = Options.boolean("watch", {
  alias: "w",
});

const filterOption = Options.choice("filter", ["all", "pending", "generating", "completed", "failed"], {
  alias: "f",
  description: "Filter by status"
}).pipe(Options.withDefault("all"));

export const statusCommand = Command.make(
  "status",
  { 
    watch: watchOption,
    filter: filterOption
  },
  ({ watch, filter }) =>
    Effect.gen(function* () {
      const showStatus = async () => {
        try {
          let questions = filter === "all" 
            ? await getAllQuestions()
            : await getQuestionsByStatus(filter as QuestionStatus);

          if (questions.length === 0) {
            console.log("\n質問が見つかりません。");
            return;
          }

          console.clear();
          console.log(`\n📊 Ask CLI 状態一覧 (${new Date().toLocaleString("ja-JP")})\n`);
          
          // 状態別の集計
          const allQuestions = await getAllQuestions();
          const stats = {
            pending: allQuestions.filter(q => q.status === "pending").length,
            generating: allQuestions.filter(q => q.status === "generating").length,
            completed: allQuestions.filter(q => q.status === "completed").length,
            failed: allQuestions.filter(q => q.status === "failed").length,
          };

          console.log("📈 統計:");
          console.log(`  待機中: ${stats.pending} | 生成中: ${stats.generating} | 完了: ${stats.completed} | 失敗: ${stats.failed}`);
          console.log("");

          if (filter !== "all") {
            console.log(`🔍 フィルター: ${formatStatus(filter as QuestionStatus)}\n`);
          }

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
        // 初回表示
        await showStatus();
        
        // 定期的に更新
        const interval = setInterval(showStatus, 2000);
        
        // プロセス終了時のクリーンアップ
        process.on('SIGINT', () => {
          clearInterval(interval);
          console.log("\n\n監視を終了しました。");
          process.exit(0);
        });

        // プロセスを維持
        yield* Effect.never;
      } else {
        yield* Effect.promise(() => showStatus());
      }
    })
);