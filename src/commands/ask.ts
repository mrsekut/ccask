import { Args, Command } from "@effect/cli";
import { Console, Effect } from "effect";
import { startBackgroundGeneration } from "../core/background-processor.js";

const questionArg = Args.text({ name: "question" });

export const askCommand = Command.make(
  "ask",
  { question: questionArg },
  async ({ question }) => {
    try {
      await startBackgroundGeneration(question);
      return Console.log("質問の処理をバックグラウンドで開始しました");
    } catch (error) {
      return Console.error(`エラーが発生しました: ${error}`);
    }
  }
);