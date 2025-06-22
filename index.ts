#!/usr/bin/env bun

import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";
import { NodeContext, NodeRuntime } from "@effect/platform-node";

// Hello worldコマンドを定義
const helloCommand = Command.make(
  "hello",
  {
    name: Options.text("name").pipe(
      Options.withDefault("World"),
      Options.withDescription("Name to greet")
    ),
  },
  ({ name }) =>
    Console.log(`Hello, ${name}! This is @effect/cli working!`)
);

// メインプログラム
const cli = Command.run(helloCommand, {
  name: "Ask CLI",
  version: "0.1.0",
});

// 実行
cli(process.argv).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
);